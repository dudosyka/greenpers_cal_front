import axios from "axios";

export class Api {
    endPoint = 'https://greenpers.bot.api.psyreply.com';
    // endPoint = 'http://localhost:3000'
    constructor() {}

    async getData(month) {
        const jbId = parseInt(localStorage.getItem('jetBotId'))
        const tgId = parseInt(localStorage.getItem('telegramId'))
        const object = parseInt(localStorage.getItem('object'))

        return await axios.get(`${this.endPoint}/get/${month}/${jbId}/${tgId}/${object}`).then(r => {
            return r.data;
        }).catch(() => {
            return [];
        })
    }

    saveData(data) {
        const jbId = parseInt(localStorage.getItem('jetBotId'))
        const tgId = parseInt(localStorage.getItem('telegramId'))
        const object = parseInt(localStorage.getItem('object'))

        axios.post(`${this.endPoint}/save/${jbId}/${tgId}/${object}`, {data}).then(data => {
            console.log(data);
        }).catch(err => {
            console.error(err);
        })
    }
}