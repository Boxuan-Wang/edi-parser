import * as constants from "../constants";

export interface IEdiMessageResult<T> {
    getIResult(): T;
    getCodeValue(): string | undefined;
    // getExplanation(): string[];
  }

export type IEdiElement = {
    key: string;
    type: ElementType;
    value?: string;
    components?: IEdiElement[];
    id: string;
    desc: string;
    dataType: string;
    required: boolean;
    minLength: number;
    maxLength: number;
    codeValue?: string;
    definition: string;
  }
  
export type IEdiSegment = {
    key: string;
    id: string;
    desc: string;
    purpose: string;
    elements: IEdiElement[];
}


export enum ElementType {
    dataElement = "Data Element",
    componentElement = "Component Element"
}

export class EdiType {
    static X12 = constants.ediDocument.x12.name;
    static EDIFACT = constants.ediDocument.edifact.name;
    static UNKNOWN = "unknown";
}

export type NAD = {
    id?: string;
    address?: string;
} //Name and Address

export type doc_version = {
    version?: number;
    release_date?: Date;
}

export type COM = {
    id?: string;
    name?: string;
    tel?: string;
    email?: string;
    telefax?:string
} // communication

export type QTY = {
    number?: number;
    uom?: string;
}

export type record = {
    received_qty?: QTY;
    good_receipt_date?: Date;
    despatch_note_time?: Date;
    reference_time?: Date;
}
export type request = {
    request_qty?: QTY;
    delivery_time_requested?: Date;
}

export type segmentSummary = {
    doc_time?: Date;
    delivery_time_requested?: Date;
    buyer?: NAD,
    seller?: NAD,
    ship_from?: NAD,
    ship_to?: NAD,
    place_port_to_discharge?: string,
    place_of_delivery?: string,
    plant_number?: string,
    buyers_item_number?: string,
    IMD?: string,
    buyers_order_number?: string,
    version?: doc_version,
    prev_version?: doc_version,
    schedule_contact?: COM,
    backorder_qty?: QTY,
    cum_received?: QTY,
    cum_ordered?: QTY,
    receive_record?: record[],
    requests?: request[]
}
