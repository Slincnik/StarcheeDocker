export default interface UserKeys {
    socialmedia: {
        instagram: string;
        youtube: string;
        twitch: string;
        vk: string;
        github: string;
    };
    description: string;
    premium: {
        status: boolean;
        end: number;
    };
}
