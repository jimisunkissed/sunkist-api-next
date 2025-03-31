export const errorMessage = (error: any) => (error instanceof Error ? error.message : 'An unknown error occured');
