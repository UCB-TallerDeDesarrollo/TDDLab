import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import type { SxProps, TableCellProps, Theme } from "@mui/material";
import type { Key, ReactNode } from "react";
import { Fragment } from "react";

export interface TableViewColumn<RowData> {
  id: string;
  header: ReactNode;
  renderCell: (row: RowData, rowIndex: number) => ReactNode;
  align?: TableCellProps["align"];
  headerSx?: SxProps<Theme>;
  cellSx?: SxProps<Theme>;
  getCellSx?: (row: RowData, rowIndex: number) => SxProps<Theme>;
}

interface TableViewProps<RowData> {
  columns: TableViewColumn<RowData>[];
  rows: RowData[];
  getRowKey?: (row: RowData, rowIndex: number) => Key;
  tableSx?: SxProps<Theme>;
  headRowSx?: SxProps<Theme>;
  bodyRowSx?: SxProps<Theme>;
  getBodyRowSx?: (row: RowData, rowIndex: number) => SxProps<Theme>;
  isRowSelected?: (row: RowData, rowIndex: number) => boolean;
  onRowClick?: (row: RowData, rowIndex: number) => void;
  onRowMouseEnter?: (row: RowData, rowIndex: number) => void;
  onRowMouseLeave?: (row: RowData, rowIndex: number) => void;
  renderExpandedRow?: (row: RowData, rowIndex: number) => ReactNode;
  expandedRowColSpan?: number;
  expandedRowCellSx?: SxProps<Theme>;
}

export const TableView = <RowData,>({
  columns,
  rows,
  getRowKey,
  tableSx,
  headRowSx,
  bodyRowSx,
  getBodyRowSx,
  isRowSelected,
  onRowClick,
  onRowMouseEnter,
  onRowMouseLeave,
  renderExpandedRow,
  expandedRowColSpan,
  expandedRowCellSx,
}: TableViewProps<RowData>) => (
  <Table sx={tableSx}>
    <TableHead>
      <TableRow sx={headRowSx}>
        {columns.map((column) => (
          <TableCell key={column.id} align={column.align} sx={column.headerSx}>
            {column.header}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row, rowIndex) => (
        <Fragment key={getRowKey?.(row, rowIndex) ?? rowIndex}>
          <TableRow
            selected={isRowSelected?.(row, rowIndex)}
            sx={getBodyRowSx ? getBodyRowSx(row, rowIndex) : bodyRowSx}
            onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
            onMouseEnter={
              onRowMouseEnter ? () => onRowMouseEnter(row, rowIndex) : undefined
            }
            onMouseLeave={
              onRowMouseLeave ? () => onRowMouseLeave(row, rowIndex) : undefined
            }
          >
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={column.getCellSx ? column.getCellSx(row, rowIndex) : column.cellSx}
              >
                {column.renderCell(row, rowIndex)}
              </TableCell>
            ))}
          </TableRow>
          {renderExpandedRow && (
            <TableRow>
              <TableCell
                colSpan={expandedRowColSpan ?? columns.length}
                sx={expandedRowCellSx}
              >
                {renderExpandedRow(row, rowIndex)}
              </TableCell>
            </TableRow>
          )}
        </Fragment>
      ))}
    </TableBody>
  </Table>
);
