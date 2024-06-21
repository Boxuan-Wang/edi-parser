import { EdifactParser } from "./parsers/edifactParser";
import fs from "fs";

async function main() {
    const file_path = "/home/fuguang/edi-parser/data/0200524552.524c5792-201d-11ef-b3dc-2f68ac1d320a.edi";
    const output_path = "/home/fuguang/edi-parser/data/output.txt";

    // await fs.promises.writeFile(output_path, output_data);
    const document_string = await fs.promises.readFile(file_path, "utf-8");
    const parser = new EdifactParser(document_string);
    const result = await parser.parse();

    const segments = await parser.parseSegments();

    for (const segment of segments) {
        fs.promises.writeFile(output_path, JSON.stringify(segment.getIResult()) + "\n", { flag: "a" });
    }

    
}

main();