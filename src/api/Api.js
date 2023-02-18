import axios from "axios";

export class Api {
    endPoint = 'https://greenpers.bot.api.psyreply.com';
    // endPoint = 'http://localhost:3000'
    constructor() {}

    async getData(month) {
        const jbId = parseInt(localStorage.getItem('jetBotId'))
        const tgId = parseInt(localStorage.getItem('telegramId'))
        const object = localStorage.getItem('object')
        const phone = localStorage.getItem('phone')

        return await axios.get(`${this.endPoint}/get/${month}/${jbId}/${tgId}/${object}/${phone}`).then(r => {
            return r.data;
        }).catch(() => {
            return [];
        })
    }

    saveData(data) {
        const jbId = parseInt(localStorage.getItem('jetBotId'))
        const tgId = parseInt(localStorage.getItem('telegramId'))
        const object = localStorage.getItem('object')
        const phone = localStorage.getItem('phone')

        axios.post(`${this.endPoint}/save/${jbId}/${tgId}/${object}/${phone}`, {data});
    }
}