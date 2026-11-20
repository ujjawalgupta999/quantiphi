import React from 'react';

interface MarkdownTableProps {
  children: React.ReactNode;
}

export const MarkdownTable: React.FC<MarkdownTableProps> = ({ children }) => {
  return (
    <div className="my-5 w-full overflow-x-auto rounded-xl border border-white/10 bg-[#161b22]/40 shadow-sm scrollbar-thin">
      <table className="w-full min-w-full divide-y divide-white/10 text-left text-sm border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-white/[0.04] text-xs uppercase font-semibold text-gray-300 tracking-wider">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-white/5 bg-transparent">
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="even:bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
    {children}
  </tr>
);

export const TableHeaderCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-200 border-r border-white/5 last:border-r-0 whitespace-nowrap">
    {children}
  </th>
);

export const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="px-4 py-3 text-gray-300 border-r border-white/5 last:border-r-0 text-[14px] leading-normal">
    {children}
  </td>
);

export default MarkdownTable;
