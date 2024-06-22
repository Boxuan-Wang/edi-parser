import * as constants from "../constants";
// import { EdiVersion } from "./entities";

export interface IEdiMessageResult<T> {
    getIResult(): T;
    getCodeValue(): string | undefined;
    getExplanation(): string[];
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

export type IEdiMessage = {
    ediVersion: EdiVersion;
    segments: IEdiSegment[];
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
