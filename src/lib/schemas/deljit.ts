export type DeljitLine = {
  partNo: string;
  description: string;
  qtyRequired: number;
  uom: string;
  deliverBy: string;
  facility: string;
};

export type DeljitMessage = {
  messageType: "DELJIT";
  tradingPartner: string;
  supplierCode: string;
  payload: {
    deljitRef: string;
    releaseDate?: string;
    periodStart: string;
    periodEnd: string;
    lines: DeljitLine[];
  };
};
