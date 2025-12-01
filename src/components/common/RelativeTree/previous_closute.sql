create or replace function update_closure_on_insert()
returns trigger as $$
begin
  if NEW.mother_id is not null then
    insert into bp_closure_table (ancestor, descendant, depth)
    select a.ancestor, NEW.id, a.depth + 1
    from bp_closure_table a
    where a.descendant = NEW.mother_id
    union all
    select NEW.mother_id, NEW.id, 1
    on conflict do nothing;
  end if;

  if NEW.father_id is not null then
    insert into bp_closure_table (ancestor, descendant, depth)
    select a.ancestor, NEW.id, a.depth + 1
    from bp_closure_table a
    where a.descendant = NEW.father_id
    union all
    select NEW.father_id, NEW.id, 1
    on conflict do nothing;
  end if;

  return NEW;
end;
$$ language plpgsql;
