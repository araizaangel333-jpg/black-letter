// Loader de "paquetes": cada archivo YAML de la carpeta trae varias entradas
// en `items`, más campos comunes (course, subject) que se copian a cada una.
// Así el glosario o el syllabus de un curso viven en un solo archivo.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

export function bundle({ base, inherit = [] }) {
  return {
    name: 'bundle-loader',
    async load({ store, parseData, logger, watcher, config }) {
      const dir = new URL(base, config.root).pathname;
      const files = readdirSync(dir).filter(f => /\.ya?ml$/.test(f) && statSync(join(dir, f)).isFile());
      store.clear();
      for (const file of files) {
        const path = join(dir, file);
        const doc = parse(readFileSync(path, 'utf8')) || {};
        const items = Array.isArray(doc) ? doc : doc.items || [];
        const common = {};
        for (const k of inherit) if (doc[k] !== undefined) common[k] = doc[k];
        for (const item of items) {
          if (!item || !item.id) throw new Error(`${relative(process.cwd(), path)}: cada entrada necesita un "id"`);
          const raw = { ...common, ...item };
          const data = await parseData({ id: item.id, data: raw, filePath: path });
          store.set({ id: item.id, data, filePath: relative(process.cwd(), path) });
        }
        watcher?.add(path);
      }
      logger.info(`${store.keys().length} entradas desde ${files.length} archivo(s) en ${base}`);
    },
  };
}
