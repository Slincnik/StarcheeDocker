import { MongoClient } from 'mongodb';

export default class DataBaseConnect {
    public dbClient: MongoClient;
    public selectDB: string;
    protected url: string;

    constructor(settings: NodeJS.ProcessEnv) {
        this.url = `mongodb://${encodeURIComponent(settings.DB_USER)}:${encodeURIComponent(
            settings.DB_PASSWORD,
        )}@${encodeURIComponent(settings.DB_HOST)}:${encodeURIComponent(
            settings.DB_PORT,
        )}/?authMechanism=DEFAULT&authSource=admin`;
        this.selectDB = settings.SELECTED_DB;
    }

    async connect() {
        try {
            this.dbClient = new MongoClient(this.url);
            await this.dbClient.connect();
            console.log('Connected to dababase');
        } catch (error) {
            console.error('Error with connect to database', error);
            process.exit(1);
        }
    }
}
