create or replace function rpc_bp_family_tree(target_id text)
returns json
language sql
as $$
with recursive all_ids as (
  -- Explicitly include the target_id first
  select target_id::text as id
  union
  select ancestor as id from bp_closure_table where descendant = target_id
  union
  select descendant as id from bp_closure_table where ancestor = target_id
),
parent_links as (
  with distinct_pairs as (
    select distinct descendant::text as descendant, ancestor::text as parent_id
    from bp_closure_table
    where depth = 1
      and descendant in (select id from all_ids)
  )
  select
    dp.descendant as id,
    json_agg(json_build_object('id', dp.parent_id) ORDER BY dp.parent_id) as parents
  from distinct_pairs dp
  group by dp.descendant
),
children_links as (
  with distinct_pairs as (
    select distinct ancestor::text as ancestor, descendant::text as child_id
    from bp_closure_table
    where depth = 1
      and ancestor in (select id from all_ids)
  )
  select
    dp.ancestor as id,
    json_agg(json_build_object('id', dp.child_id) ORDER BY dp.child_id) as children
  from distinct_pairs dp
  group by dp.ancestor
),
spouse_links as (
  with distinct_pairs as (
    select distinct p1.ancestor::text as ancestor, p2.ancestor::text as spouse_id
    from bp_closure_table p1
    join bp_closure_table p2 on p1.descendant = p2.descendant
    where p1.depth = 1 and p2.depth = 1
      and p1.ancestor in (select id from all_ids)
      and p2.ancestor != p1.ancestor
  )
  select
    dp.ancestor as id,
    json_agg(json_build_object('id', dp.spouse_id) ORDER BY dp.spouse_id) as spouses
  from distinct_pairs dp
  group by dp.ancestor
),
sibling_links as (
  select
    s.id,
    json_agg(row_to_json(t)) as siblings
  from ballpythons target
  join ballpythons s on s.id != target.id
    and (
      (s.mother_id is not null and s.mother_id = target.mother_id) or
      (s.father_id is not null and s.father_id = target.father_id)
    )
    and s.shadow_date_hatch = target.shadow_date_hatch
  join lateral (
    select s.id
  ) t on true
  where target.id in (select id from all_ids)
  group by s.id
)
select json_agg(json_build_object(
  'id', a.id,
  'snake_name', a.snake_name,
  'gender', a.sex,
  'genes', a.genes,
  'picture', a.picture,
  'parents', coalesce(par.parents, '[]'),
  'siblings', coalesce(sib.siblings, '[]'),
  'children', coalesce(ch.children, '[]'),
  'spouses', coalesce(sp.spouses, '[]')
))
from ballpythons a
left join parent_links par on par.id = a.id
left join sibling_links sib on sib.id = a.id
left join children_links ch on ch.id = a.id
left join spouse_links sp on sp.id = a.id
where a.id in (select id from all_ids)
$$;
