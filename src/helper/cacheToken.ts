let cacheToken: string | null = null;

export const setCacheToken = (token: string) => {
  cacheToken = token;
};

export const getCacheToken = () => {
    return localStorage.getItem('token');
}