export default {
    fastsub: (str: string, index: number, offset: number): string => {
        return str.slice(index, index + offset);
    }
}