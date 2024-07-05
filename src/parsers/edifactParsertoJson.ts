import { EdifactParser } from "./edifactParser";
import { EdiSegment } from "./entities";
import { COM, NAD, QTY, doc_version, record, request, segmentSummary } from "./type_def";

enum ParsingState {
    readCOM,      // parsing communication detail
    readDeliveryRecord,   // parsing delivered DeliveryRecord
    readRequest,  // parsing delivery request
    readVersion,  // parsing version info
    readOneLine,  // parsing one line info
    outOfMessage  // not within a message
};



class NameAndAddress implements NAD {
    id?: string | undefined;
    address?: string | undefined;

    constructor() {
        this.id = undefined;
    }

    setId(id: string) {
        this.id = id;
    }

    setAddress(address: string) {
        this.address = address;
    }

    
    public toString(): string {
        const ret = {
            id: this.id,
            address: this.address || ""
        };
        return JSON.stringify(ret);
    }
}

class Version implements doc_version {
    version?: number | undefined;
    release_date?: Date | undefined;
    
    constructor() {
        this.version = undefined;
    }

    setVersion(version: number) {
        this.version = version;
    }

    setDate(date: Date) {
        this.release_date = date;
    }
    
    public toString(): string {
        const ret = {
            version: this.version,
            date: this.release_date
        }
        return JSON.stringify(ret);
    }

}

class Communication implements COM {
    id?: string | undefined;
    name?: string | undefined;
    tel?: string | undefined;
    email?: string | undefined;
    telefax?: string | undefined;
    
    constructor () {

    }

    setId(id: string) {
        this.id = id;
    }

    setName(name: string) {
        this.name = name;
    };

    setTelephone (tel: string) {
        this.tel = tel;
    }

    selTelFax(telfax: string) {
        this.telefax = telfax;
    }

    setEmail(email: string) {
        this.email = email;
    }

    public toString(): string {
        const ret = {
            id: this.id,
            name: this.name,
            telephone: this.tel,
            email: this.email,
            telefax: this.telefax
        };

        return JSON.stringify(ret);
    }
}

class Quantity implements QTY {

    number?: number | undefined;
    uom?: string | undefined;

    constructor(num: number, uom: string) {
        this.number = num;
        this.uom = uom;
    }

    setNumber(num: number) {
        this.number = num;
    }
    setUom(uom: string) {
        this.uom = uom;
    }

    public toString(): string {
        const ret = {
            number: this.number,
            uom: this.uom
        };
        return JSON.stringify(ret);
    }
}

class DeliveryRecord implements DeliveryRecord {
    received_qty?: Quantity;
    good_receipt_date?: Date;
    despatch_note_time?: Date;
    reference_time?: Date;

    constructor() {

    }

    setReceiveQty(quant: Quantity) {
        this.received_qty = quant;
    }

    setReceiptDate(r_date: Date) {
        this.good_receipt_date = r_date;
    }

    setDespatchNoteDate(d_date: Date) {
        this.despatch_note_time = d_date;
    }

    setRefTime(ref_time: Date) {
        this.reference_time = ref_time;
    }

    public toString(): string {
        const ret = {
            received_qty: this.received_qty ? this.received_qty.toString() : undefined,
            good_receipt_date: this.good_receipt_date ? this.good_receipt_date.toString() : undefined,
            despatch_note_date: this.despatch_note_time ? this.despatch_note_time.toString(): undefined,
            reference_time: this.reference_time ? this.reference_time.toString(): undefined
        };
        return JSON.stringify(ret);
    }

}

class Request implements request {
    request_qty?: Quantity;
    delivery_time_requested?: Date;

    constructor() {

    }

    setQuant(quant: Quantity) {
        this.request_qty = quant;
    }

    setDeliveryTime(date: Date) {
        this.delivery_time_requested = date;
    }

    public toString(): string {
        const ret = {
            request_quantity: this.request_qty ? this.request_qty.toString() : undefined,
            delivery_time_requested: this.delivery_time_requested ? this.delivery_time_requested.toString() : undefined
        };
        return JSON.stringify(ret);
    }
    
}


class EdiMessage {
    // print the message in JSON format
    private state: ParsingState;

    // private doc_time?: Date;
    // private delivery_time_requsted?: Date;
    // private seller?: NameAndAddress;
    // private ship_from?: NameAndAddress;
    // private ship_to: NameAndAddress;
    // private place_port_to_discharge?: string;
    // private place_of_delivery: string;
    // private plant_number?: string;
    // private buyers_item_number?: string;
    // private IMD?: string;
    // private buyers_order_number?: string;
    // private version?: Version;
    // private prev_version?: Version;
    // private schedule_contact?: Communication;
    // private backorder_qty?: Quantity;
    // private cum_received?: Quantity;
    // private cum_ordered?: Quantity;
    // private receive_DeliveryRecord?: DeliveryRecord[];
    // private requests?: Request[];

    // private nad_buffer?: NameAndAddress;
    private version_buffer?: Version;
    private com_buffer?: Communication;
    private qty_buffer?: Quantity;
    private DeliveryRecord_buffer?: DeliveryRecord;
    private request_buffer?: Request;
    private codeValue_buffer?: string;

    private store: {[key: string]: string | Date | NameAndAddress | 
        Version | Communication | Quantity | DeliveryRecord[] | Request[]} = {};


    constructor() {
        this.state = ParsingState.outOfMessage;
    }

    // return false on error, otherwise true
    public consumeSegments(segments: EdiSegment[]): boolean {
        let ret: boolean = true;

        // const segment_explanation = segment.getValueStrings();
        // const ind = segment.getCodeValue() || "";

        // switch (this.state) {
        //     case ParsingState.outOfMessage: {
        //         if (segment.id == "UNH") {
        //             this.state = ParsingState.readOneLine;
        //         }
        //     }

        //     case ParsingState.readOneLine: {
        //         switch (segment.id) {
        //             case "DTM": {                            
        //                 this.store[ind] = new Date(segment_explanation[0]); 
        //             }
        //             case "NAD": {
        //                 let nad_buffer = new NameAndAddress();
        //                 nad_buffer.setId(segment[0]);
        //                 nad_buffer.setAddress(segment_explanation.slice(1).join());

        //                 this.store[ind] = nad_buffer.toString();
        //             }
        //             case "QTY": {
        //                 this.state = ParsingState.readDeliveryRecord;
        //                 this.DeliveryRecord_buffer = new DeliveryRecord();
        //                 let quant_tem = new Quantity(new Number(segment_explanation[0]).valueOf(), segment_explanation[1]);
        //                 this.DeliveryRecord_buffer.setReceiveQty(quant_tem);
        //                 this.codeValue_buffer = segment.getCodeValue() || "";
        //             }
        //             case "SCC": {
        //                 this.state = ParsingState.readRequest;

        //             }

        //             default: {
        //                 this.store[ind] = segment_explanation.join();
        //             }

        //         }
                
        //     }

        //     case ParsingState.readDeliveryRecord: {
        //         switch(segment.id) {
        //             case "QTY": {
        //                 // One line quantity segment
        //                 this.state = ParsingState.readOneLine;
        //                 const quant_tem = this.DeliveryRecord_buffer?.received_qty;
        //                 this.store[this.codeValue_buffer || ""] = quant_tem?.toString() || "";
        //                 this.codeValue_buffer = undefined;
        //                 this.DeliveryRecord_buffer = undefined;
        //             }
        //             case "DTM" || "" // preview the next segment id

        //         }
        //     }
        // }

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            while(segment.id != "UNH") {
                continue;
            }
            

        }

        return ret;
    }

    toJSON(): string[] {
        return [];
    }
}

export class EdifactParserToJSON {
    private ediparser: EdifactParser;

    constructor(document: string) {
        this.ediparser = new EdifactParser(document);
    }

    public async toJSON(): Promise<string[]> {
        let state: ParsingState = ParsingState.outOfMessage;
        let json_strings: string[] = [];
        let edi_message: EdiMessage = new EdiMessage();

        await this.ediparser.parse();
        const segments: EdiSegment[] = await this.ediparser.parseSegments();

        edi_message.consumeSegments(segments);
        
        return edi_message.toJSON();
    }
}