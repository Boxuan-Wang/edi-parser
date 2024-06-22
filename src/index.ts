import { EdifactParser } from "./parsers/edifactParser";
import fs from "fs";

async function main() {
    const data_dir = "data";
    const output_dir = "data";

    const files = await fs.promises.readdir(data_dir);
    for (const file of files) {
        if (file.endsWith(".edi")) {
            const file_content = await fs.promises.readFile(`${data_dir}/${file}`, "utf-8");

            const parser = new EdifactParser(file_content);
            const segments = await parser.parseSegments();
            
            const output_file = `${output_dir}/${file.replace(".edi", ".txt")}`;
            for (const segment of segments) {
                await fs.promises.writeFile(output_file, segment.getExplanation() + "\n", { flag: "a" });
            }
        }
    }
    
}

main();