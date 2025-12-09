export const LIMITS = {
    MAX_PHOTOS: 3,
    MAX_PHOTOS_CLOSET: 5,
    MAX_PHOTOS_SELECT: 5,
    MIN_BRANDS: 3,
} as const;

export const ANIMATION = {
    PULSE_DURATION: 2000,
    PULSE_SCALE_TO: 1.05,
    PULSE_SCALE_FROM: 1,
    OUTER_PULSE_DELAY: 0,
    MIDDLE_PULSE_DELAY: 300,
    INNER_PULSE_DELAY: 600,
    OPACITY_DISABLED: 0.5,
    OPACITY_ENABLED: 1,
    OPACITY_SIDE_CARD: 0.5,
    OPACITY_DISTANT_CARD: 0.3,
    SCALE_SIDE_CARD: 0.95,
    SCALE_DISTANT_CARD: 0.9,
} as const;

export const IMAGE_QUALITY = {
    DEFAULT: 0.8,
} as const;

export const CAROUSEL = {
    CARD_WIDTH_RATIO: 0.55,
    CARD_SPACING: 10,
} as const;

export interface Stylist {
    id: string;
    name: string;
    description: string;
    image?: any;
}

export const STYLISTS: Stylist[] = [
    {
        id: '1',
        name: 'Celine',
        description: "Bonjour, darling. I'm your AI stylist, expertly trained in luxury fashion. From elevated streetwear to full-glam gala looks, I curate outfits that always look expensive, polished, and on point. I work with high-end designers, runway trends, and statement pieces to make sure you step out looking like a million dollars — no matter the occasion.",
        image: require('@/assets/s1.png'),
    },
    {
        id: '2',
        name: 'Harper',
        description: "Hello Lucia. I'm here to ensure you never leave the house looking anything less than extraordinary. Let's begin",
        image: require('@/assets/s2.png'),
    },
    {
        id: '3',
        name: 'Carlos',
        description: "Hey there! I'm Carlos, your go-to stylist for modern, versatile looks. I specialize in creating outfits that seamlessly transition from day to night, mixing classic pieces with contemporary trends.",
        image: require('@/assets/s3.png'),
    },
];

export const OCCUPATIONS = [
    'Lawyer',
    'Marketing lead',
    'Software Engineer',
] as const;

export const BRANDS = [
    'Prada',
    'Adidas',
    'AMI Paris',
    'ASOS',
    'Nike',
    'Gucci',
    'Zara',
    'H&M',
    'Uniqlo',
    'Levi\'s',
] as const;

export const AI_CHAT_PRODUCTS = {
    existing: [
        {
            id: 'ep1',
            image: require('@/assets/ep1.png'),
            title: 'Existing Piece 1',
            description: 'From your closet',
            price: '$0',
        },
        {
            id: 'ep2',
            image: require('@/assets/ep2.png'),
            title: 'Existing Piece 2',
            description: 'From your closet',
            price: '$0',
        },
        {
            id: 'ep3',
            image: require('@/assets/ep3.png'),
            title: 'Existing Piece 3',
            description: 'From your closet',
            price: '$0',
        },
    ],
    newLook: [
        {
            id: 'nl1',
            image: require('@/assets/nl1.png'),
            title: 'New Look Item 1',
            description: 'Shop this look',
            price: '$89',
        },
        {
            id: 'nl2',
            image: require('@/assets/nl2.png'),
            title: 'New Look Item 2',
            description: 'Shop this look',
            price: '$95',
        },
        {
            id: 'nl4',
            image: require('@/assets/nl4.png'),
            title: 'New Look Item 3',
            description: 'Shop this look',
            price: '$120',
        },
    ],
} as const;

export const ONBOARDING = {
    TOTAL_STEPS: 2,
    MIN_BRANDS_REQUIRED: 3,
} as const;

export interface OrderItem {
    id: string;
    image: any;
    brand: string;
    title: string;
    price: string;
    size?: string;
}

export const DEFAULT_ORDER_ITEMS: OrderItem[] = [
    {
        id: 'acc1',
        image: require('@/assets/d1.png'),
        brand: 'Tory Burch',
        title: 'Designer Sandals Pierced Multi-Strap Heeled Sandal',
        price: '$200.00',
        size: '7',
    },
    {
        id: 'acc2',
        image: require('@/assets/d2.png'),
        brand: 'Savetter',
        title: 'Savette Florence 25 leather tote bag',
        price: '$200.00',
    },
    {
        id: 'acc3',
        image: require('@/assets/d3.png'),
        brand: 'Jil Sander',
        title: 'Jil Sander Twisted hoop earings',
        price: '$200.00',
    },
    {
        id: 'acc4',
        image: require('@/assets/d4.png'),
        brand: 'Rotate Birger',
        title: 'Designer Sandals Pierced Multi-Strap Heeled Sandal',
        price: '$200.00',
    },
];

export const DEFAULTS = {
    FIRST_NAME: 'Lucia',
} as const;

export const URLS = {
    TERMS: 'https://luxify.com/terms',
    PRIVACY: 'https://luxify.com/privacy',
} as const;

