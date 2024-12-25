import React from "react";
import { columns, debtColumns, inDebts, Payment, payments } from "./columns";
import { DataTable } from "./dataTable";


const DemoPage: React.FC<{}> = () => {
  const data = inDebts
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={debtColumns} data={data}/>
    </div>
  )
}
export default DemoPage;