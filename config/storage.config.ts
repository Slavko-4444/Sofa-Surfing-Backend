
export const  StorageConfiguraion = {     
    photo: { 
        destination: '../storage/',
        urlPrefix: '/assets/photos/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // ovo se koristi za kesiranje, kod ucitavanja slika gdje ce se iz kes memorije reloadovati ista fotografija racunajuci da se nije mijenjala u bazi (ili brisala) 
        maxSize: 1024 * 1024 * 2,
        resize: {
            small: {
                widht: 320,
                height: 240,
                path: '../storage/small'
            },
            thumb: { 
                widht: 120,
                height: 100,
                path: '../storage/thumb'
            }
        }
    }
}
