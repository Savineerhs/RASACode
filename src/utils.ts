import { statSync, readdirSync } from "fs"
import { join } from "path"

export function recursiveRead(path: string, ignoreEntities: string[])
{
    let files: string[] = [];
    read(path, ignoreEntities, files);
    return files;
}

function read(directory: string, ignoreEntities: string[], files: string[]) 
{
    readdirSync(directory).forEach(entity => {
        if (!ignoreEntities.includes(entity))
        {
            const absolute = join(directory, entity);
            if (statSync(absolute).isDirectory()) 
                return read(absolute, ignoreEntities, files);
            else 
                if (entity.split('.').pop() == "yml" || entity.split('.').pop() == "yaml")
                    return files.push(absolute);
        }
    });
}