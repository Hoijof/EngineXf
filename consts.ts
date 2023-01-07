let debug = false;


export function gk(key: string) {
    switch (key) {
        case 'DEBUG':
            return debug
    }
}

export function sk(key: string, value: any) {
    switch (key) {
        case 'DEBUG':
            debug = value;
            break;
    }
}