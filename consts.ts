let debug = false;


export function gk(key: string) {
    switch (key) {
        case 'DEBUG':
            return debug
        case 'PLAYER':
            return {
                WIDTH: 50,
                HEIGTH: 50,
                SPEED: 25,
                ACCELERATION: 4000,
                MAX_SPEED: 1000,
            }
        case 'STOP_SPEED':
            return 0.4;
    }
}

export function sk(key: string, value: any) {
    switch (key) {
        case 'DEBUG':
            debug = value;
            break;
    }   
}