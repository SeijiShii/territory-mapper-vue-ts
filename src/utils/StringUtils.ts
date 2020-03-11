export default class StringUtils {
    static generateId(prefix: string){
        const timeInMillis = new Date().getTime();
        const rnd = Math.floor(Math.random() * 10000);
        const padded = ('0000' + rnd).slice(-4);
        return prefix + '_' + timeInMillis + '_' + padded;
    }

}

