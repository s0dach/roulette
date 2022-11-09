import {Query} from "@nestjs/common"

export class Utils {
    async validURL(str) {
        return str.match('(http|ftp|https)://([\\w_-]+(?:(?:\\.[\\w_-]+)+))([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?')
    }

    async removeTags(str) {
        if ((str === null) || (str === '')) return false
        str = str.toString()
        return str.replace(/(<([^>]+)>)/ig, '')
    }

    async parseDataTableQuery(@Query() query): Promise<any> {
        const draw = query.draw,
            row = query.start,
            length = query.length,
            columnIndex = query.order[0].column,
            columnName = query.columns[columnIndex].data,
            columnSortOrder = query.order[0].dir,
            searchValue = query.search.value

        return { draw, row, length, columnName, columnSortOrder, searchValue }
    }
    
    async ksort(obj){
        const keys = Object.keys(obj).sort()
            , sortedObj = {}

        for (const i in keys) {
            sortedObj[keys[i]] = obj[keys[i]]
        }

        return sortedObj
    }
}

export function wait(time: number) {
    return new Promise(resolve => setTimeout(resolve, Math.max(0, time)))
}

export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export function reset(array) {
    let first_elm, key

    if (array.constructor === Array){
        first_elm = array[0]
    } else {
        for (key in array){
            first_elm = array[key]
            break
        }
    }
    return first_elm
}
