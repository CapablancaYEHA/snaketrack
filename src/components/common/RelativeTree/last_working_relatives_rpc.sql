CREATE OR REPLACE FUNCTION rpc_bp_family_tree(target_id text)
RETURNS json
LANGUAGE sql
AS $$
WITH RECURSIVE
-- seed: start with the target and its direct parents/children
seed_ids AS (
  SELECT target_id::text AS id
  UNION
  SELECT ancestor::text FROM bp_closure_table WHERE descendant = target_id
  UNION
  SELECT descendant::text FROM bp_closure_table WHERE ancestor = target_id
),

-- next_ids will iteratively add spouse candidates (other ancestors sharing children)
next_ids(id) AS (
  -- initial set is the seed
  SELECT id FROM seed_ids

  UNION

  -- for each id in the previous iteration, add other ancestors who share a child (spouses)
  SELECT DISTINCT p2.ancestor::text
  FROM bp_closure_table p1
  JOIN bp_closure_table p2 ON p1.descendant = p2.descendant
  JOIN next_ids prev ON p1.ancestor::text = prev.id
  WHERE p1.depth = 1 AND p2.depth = 1
    AND p2.ancestor::text != p1.ancestor::text
),

-- ensure all_ids is distinct (defensive)
all_ids AS (
  SELECT DISTINCT id FROM next_ids
),

-- compute parents for ids in all_ids
parent_links AS (
  WITH distinct_pairs AS (
    SELECT DISTINCT descendant::text AS descendant, ancestor::text AS parent_id
    FROM bp_closure_table
    WHERE depth = 1
      AND descendant IN (SELECT id FROM all_ids)
  )
  SELECT
    dp.descendant AS id,
    jsonb_agg(jsonb_build_object('id', dp.parent_id) ORDER BY dp.parent_id) AS parents
  FROM distinct_pairs dp
  GROUP BY dp.descendant
),

-- compute children for ids in all_ids
children_links AS (
  WITH distinct_pairs AS (
    SELECT DISTINCT ancestor::text AS ancestor, descendant::text AS child_id
    FROM bp_closure_table
    WHERE depth = 1
      AND ancestor IN (SELECT id FROM all_ids)
  )
  SELECT
    dp.ancestor AS id,
    jsonb_agg(jsonb_build_object('id', dp.child_id) ORDER BY dp.child_id) AS children
  FROM distinct_pairs dp
  GROUP BY dp.ancestor
),

-- compute spouses for ids in all_ids
spouse_links AS (
  WITH distinct_pairs AS (
    SELECT DISTINCT p1.ancestor::text AS ancestor, p2.ancestor::text AS spouse_id
    FROM bp_closure_table p1
    JOIN bp_closure_table p2 ON p1.descendant = p2.descendant
    WHERE p1.depth = 1 AND p2.depth = 1
      AND p1.ancestor IN (SELECT id FROM all_ids)
      AND p2.ancestor != p1.ancestor
  )
  SELECT
    dp.ancestor AS id,
    jsonb_agg(jsonb_build_object('id', dp.spouse_id) ORDER BY dp.spouse_id) AS spouses
  FROM distinct_pairs dp
  GROUP BY dp.ancestor
),

-- compute siblings for each id in all_ids (uses ballpythons direct parent columns)
sibling_links AS (
  SELECT
    t.id AS id,
    COALESCE(
      (
        SELECT jsonb_agg(sib ORDER BY sib->>'id')
        FROM (
          SELECT s2.id, jsonb_build_object(
            'id', s2.id,
            'snake_name', s2.snake_name,
            'picture', s2.picture,
            'sex', s2.sex,
            'shadow_date_hatch', s2.shadow_date_hatch
          ) AS sib
          FROM (
            SELECT DISTINCT s.id
            FROM public.ballpythons s
            WHERE s.id <> t.id
              AND (
                (t.mother_id IS NOT NULL AND s.mother_id = t.mother_id)
                OR (t.father_id IS NOT NULL AND s.father_id = t.father_id)
              )
              AND (DATE_TRUNC('day', s.shadow_date_hatch::timestamptz) IS NOT DISTINCT FROM DATE_TRUNC('day', t.shadow_date_hatch::timestamptz))
          ) ids
          JOIN public.ballpythons s2 ON s2.id = ids.id
        ) q
      ),
      '[]'::jsonb
    ) AS siblings
  FROM all_ids aid
  JOIN public.ballpythons t ON t.id = aid.id
  GROUP BY t.id
),

-- extract sibling ids discovered above so we can ensure they are roots too
sibling_ids AS (
  SELECT DISTINCT (jsonb_array_elements(siblings)->>'id')::text AS id
  FROM sibling_links
  WHERE siblings <> '[]'::jsonb
),

-- final_all_ids includes original all_ids plus any sibling ids found
final_all_ids AS (
  SELECT id FROM all_ids
  UNION
  SELECT id FROM sibling_ids
),

-- recompute parent/child/spouse/sibling aggregations against final_all_ids
parent_links_final AS (
  WITH distinct_pairs AS (
    SELECT DISTINCT descendant::text AS descendant, ancestor::text AS parent_id
    FROM bp_closure_table
    WHERE depth = 1
      AND descendant IN (SELECT id FROM final_all_ids)
  )
  SELECT
    dp.descendant AS id,
    jsonb_agg(jsonb_build_object('id', dp.parent_id) ORDER BY dp.parent_id) AS parents
  FROM distinct_pairs dp
  GROUP BY dp.descendant
),

children_links_final AS (
  WITH distinct_pairs AS (
    SELECT DISTINCT ancestor::text AS ancestor, descendant::text AS child_id
    FROM bp_closure_table
    WHERE depth = 1
      AND ancestor IN (SELECT id FROM final_all_ids)
  )
  SELECT
    dp.ancestor AS id,
    jsonb_agg(jsonb_build_object('id', dp.child_id) ORDER BY dp.child_id) AS children
  FROM distinct_pairs dp
  GROUP BY dp.ancestor
),

spouse_links_final AS (
  WITH distinct_pairs AS (
    SELECT DISTINCT p1.ancestor::text AS ancestor, p2.ancestor::text AS spouse_id
    FROM bp_closure_table p1
    JOIN bp_closure_table p2 ON p1.descendant = p2.descendant
    WHERE p1.depth = 1 AND p2.depth = 1
      AND p1.ancestor IN (SELECT id FROM final_all_ids)
      AND p2.ancestor != p1.ancestor
  )
  SELECT
    dp.ancestor AS id,
    jsonb_agg(jsonb_build_object('id', dp.spouse_id) ORDER BY dp.spouse_id) AS spouses
  FROM distinct_pairs dp
  GROUP BY dp.ancestor
),

sibling_links_final AS (
  SELECT
    t.id AS id,
    COALESCE(
      (
        SELECT jsonb_agg(sib ORDER BY sib->>'id')
        FROM (
          SELECT s2.id, jsonb_build_object(
            'id', s2.id,
            'snake_name', s2.snake_name,
            'picture', s2.picture,
            'sex', s2.sex,
            'shadow_date_hatch', s2.shadow_date_hatch
          ) AS sib
          FROM (
            SELECT DISTINCT s.id
            FROM public.ballpythons s
            WHERE s.id <> t.id
              AND (
                (t.mother_id IS NOT NULL AND s.mother_id = t.mother_id)
                OR (t.father_id IS NOT NULL AND s.father_id = t.father_id)
              )
              AND (DATE_TRUNC('day', s.shadow_date_hatch::timestamptz) IS NOT DISTINCT FROM DATE_TRUNC('day', t.shadow_date_hatch::timestamptz))
          ) ids
          JOIN public.ballpythons s2 ON s2.id = ids.id
        ) q
      ),
      '[]'::jsonb
    ) AS siblings
  FROM final_all_ids aid
  JOIN public.ballpythons t ON t.id = aid.id
  GROUP BY t.id
)

SELECT (jsonb_agg(
  jsonb_build_object(
    'id', COALESCE(a.id, ai.id),
    'snake_name', a.snake_name,
    'gender', a.sex,
    'genes', a.genes,
    'picture', a.picture,
    'owner_id', a.owner_id,
    'parents', COALESCE(par.parents, '[]'::jsonb),
    'siblings', COALESCE(sib.siblings, '[]'::jsonb),
    'children', COALESCE(ch.children, '[]'::jsonb),
    'spouses', COALESCE(sp.spouses, '[]'::jsonb)
  ) ORDER BY COALESCE(a.id, ai.id)
))::json
FROM final_all_ids ai
LEFT JOIN ballpythons a ON a.id = ai.id
LEFT JOIN parent_links_final par ON par.id = ai.id
LEFT JOIN sibling_links_final sib ON sib.id = ai.id
LEFT JOIN children_links_final ch ON ch.id = ai.id
LEFT JOIN spouse_links_final sp ON sp.id = ai.id;
$$;