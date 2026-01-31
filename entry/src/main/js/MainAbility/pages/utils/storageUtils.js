import file from '@system.file';

class StorageUtil {
    static directory = 'internal://app/directory/';

    static createNewDirectory() {
        file.mkdir({
            uri: this.directory,
            success: () => console.info('Directory has been created.'),
            fail: () => {
            }
        });
    }

    static saveDataInChunks(keyPrefix, data) {
        const path = `${this.directory}${keyPrefix}.json`;
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        file.writeText({
            uri: path,
            text: text,
            success: () => console.info(`"${keyPrefix}" Saved.`),
            fail: (_, code) => console.error(`"${keyPrefix}" error: ` + code)
        });
    }

    static readDataFromChunks(keyPrefix, callback) {
        const path = `${this.directory}${keyPrefix}.json`;

        file.readText({
            uri: path,
            success: function(text) {
                try {
                    const parsedData = typeof text === 'string' ? JSON.parse(text) : text;
                    const finalData = JSON.parse(parsedData.text);

                    callback(finalData);
                } catch (e) {
                    callback(text);
                }
            },
            fail: function(_, code) {
                console.error(`"${keyPrefix}" cannot read: ` + code);
                callback(null);
            }
        });
    }

    static deleteDataInChunks(keyPrefix) {
        const path = `${this.directory}${keyPrefix}.json`;

        file.delete({
            uri: path,
            success: () => console.info(`"${keyPrefix}" deleted.`),
            fail: (_, code) => console.error(`"${keyPrefix}" cannot deleted: ` + code)
        });
    }
}

export default StorageUtil;