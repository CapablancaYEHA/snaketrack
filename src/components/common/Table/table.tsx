import { useEffect, useState } from "preact/hooks";
import { sortBy } from "lodash-es";
import { DataTable, DataTableSortStatus } from "mantine-datatable";

// FIXME все-таки надо делать таблицу tanstack и пропихивать туда mantine
export const Table = ({ rows, columns }) => {
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: "",
    direction: "asc",
  });
  const [records, setRecords] = useState(sortBy(rows, "feed_last_at"));

  useEffect(() => {
    const data = sortBy(
      rows.filter((a) => Object.values(a)?.some((b) => b != null)),
      sortStatus.columnAccessor,
    ) as any[];
    setRecords(sortStatus.direction === "desc" ? data.reverse() : data);
  }, [sortStatus, rows]);

  return (
    <DataTable
      styles={{
        table: {
          tableLayout: "fixed",
        },
      }}
      withTableBorder
      borderRadius="sm"
      withColumnBorders
      withRowBorders={false}
      striped
      highlightOnHover
      pinFirstColumn={true}
      records={records}
      columns={columns}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      textSelectionDisabled
      minHeight={130}
      noRecordsText="Нет данных по змее"
    />
  );
};
