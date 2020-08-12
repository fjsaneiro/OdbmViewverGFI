export class User {
    constructor(
        public email: string,
        private ptoken: string,
        public expirationDate: Date
    ) {}

    get token(): string {
        if (!this.expirationDate || new Date() > this.expirationDate) {
            return null;
        }
        return this.ptoken;
    }
}
