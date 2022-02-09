export default interface ICooldown {
    start: number;
    usages: number;
    timeout: () => void;
}
