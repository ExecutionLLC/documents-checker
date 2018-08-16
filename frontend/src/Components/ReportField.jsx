import React from "react";

function ReportField({title, value, className}) {
  return (
    <div className={`row ${className}`}>
      <div className="col-md-6">{title}</div>
      <div className="col-md-6">{value}</div>
    </div>
  );
};

export default ReportField;