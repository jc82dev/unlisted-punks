(function (window) {
  // const
  const ORIGINAL_PUNKS_SUPPLY = 10000;
  const TOTAl_SUPPLY = { MALE: 29527680, FEMALE: 6092800 };
  // helpers
  const sortAtributes = (a, b) => a.localeCompare(b);
  const sortAttributeValue = (a, b) => (a === b ? 0 : a === 'none' ? -1 : b === 'none' ? 1 : a.localeCompare(b));
  // cache
  const CACHE = {}; // TODO: cachear calculos intermedios
  // data
  window.SPRITES = {
    male: {
      skin: {
        alien: 1,
        ape: 3,
        zombie: 13,
        'human-lighter': 11,
        'human-light': 10,
        'human-dark': 8,
        'human-darker': 9,
      },
      blemish: {
        none: null,
        mole: 84,
        'rosy-cheeks': 85,
        spots: 86,
      },
      ear: {
        none: null,
        earring: 87,
      },
      eyes: {
        none: null,
        '3d-glasses': 88,
        'big-shades': 89,
        'classic-shades': 90,
        'clown-eyes-blue': 91,
        'clown-eyes-green': 92,
        'eye-mask': 93,
        'eye-patch': 94,
        'horned-rim-glasses': 95,
        'nerd-glasses': 96,
        'regular-shades': 97,
        'small-shades': 98,
        vr: 99,
      },
      'facial-hair': {
        none: null,
        'big-beard': 100,
        chinstrap: 101,
        'front-beard-dark': 102,
        'front-beard': 103,
        goat: 104,
        handlebars: 105,
        'luxurious-beard': 106,
        mustache: 107,
        muttonchops: 108,
        'normal-beard-black': 109,
        'normal-beard': 110,
        'shadow-beard': 111,
      },
      head: {
        none: null,
        bandana: 112,
        beanie: 113,
        'cap-forward': 114,
        cap: 115,
        'clown-hair-green': 116,
        'cowboy-hat': 117,
        'crazy-hair': 118,
        'do-rag': 119,
        fedora: 120,
        'frumpy-hair': 121,
        headband: 122,
        hoodie: 123,
        'knitted-cap': 124,
        'messy-hair': 125,
        'mohawk-dark': 126,
        'mohawk-thin': 127,
        mohawk: 128,
        'peak-spike': 129,
        'police-cap': 130,
        'purple-hair': 131,
        'shaved-head': 132,
        'stringy-hair': 133,
        'top-hat': 134,
        'vampire-hair': 135,
        'wild-hair': 136,
      },
      mouth: {
        none: null,
        'buck-teeth': 137,
        smile: 143,
        frown: 141,
      },
      'mouth-accessory': {
        none: null,
        cigarette: 138,
        pipe: 139,
        vape: 140,
        'medical-mask': 142,
      },
      neck: {
        none: null,
        'gold-chain': 144,
        'silver-chain': 145,
      },
      nose: {
        none: null,
        'clown-nose': 146,
      },
    },
    female: {
      skin: {
        alien: 0,
        ape: 2,
        zombie: 12,
        'human-lighter': 7,
        'human-light': 6,
        'human-dark': 4,
        'human-darker': 5,
      },
      blemish: {
        none: null,
        mole: 14,
        'rosy-cheeks': 15,
        spots: 16,
      },
      ear: {
        none: null,
        earring: 17,
      },
      eyes: {
        none: null,
        '3d-glasses': 18,
        'big-shades': 19,
        'blue-eye-shadow': 20,
        'classic-shades': 21,
        'clown-eyes-blue': 22,
        'clown-eyes-green': 23,
        'eye-mask': 24,
        'eye-patch': 25,
        'green-eye-shadow': 26,
        'horned-rim-glasses': 27,
        'nerd-glasses': 28,
        'purple-eye-shadow': 29,
        'regular-shades': 30,
        'small-shades': 31,
        vr: 32,
        'welding-goggles': 33,
      },
      head: {
        none: null,
        bandana: 34,
        beanie: 35,
        'blonde-bob': 36,
        'blonde-short': 37,
        'cap-forward': 38,
        cap: 39,
        'clown-hair-green': 40,
        'cowboy-hat': 41,
        'crazy-hair': 42,
        'dark-hair': 43,
        'do-rag': 44,
        fedora: 45,
        'frumpy-hair': 46,
        'half-shaved': 47,
        headband: 48,
        hoodie: 49,
        'knitted-cap': 50,
        'messy-hair': 51,
        'mohawk-thin': 52,
        'mohawk-dark': 53,
        mohawk: 54,
        'orange-side': 55,
        pigtails: 56,
        'pilot-helmet': 57,
        'pink-with-hat': 58,
        'police-cap': 59,
        'purple-hair': 60,
        'red-mohawk': 61,
        'shaved-head': 62,
        'straight-hair-blonde': 63,
        'straight-hair-dark': 64,
        'straight-hair': 65,
        'stringy-hair': 66,
        'tassle-hat': 67,
        tiara: 82,
        'top-hat': 68,
        'wild-blonde': 69,
        'wild-hair': 70,
        'wild-white-hair': 71,
      },
      mouth: {
        none: null,
        'black-lipstick': 75,
        'hot-lipstick': 76,
        'purple-lipstick': 78,
      },
      'mouth-accessory': {
        none: null,
        cigarette: 72,
        pipe: 73,
        vape: 74,
        'medical-mask': 77,
      },
      neck: {
        none: null,
        choker: 79,
        'gold-chain': 80,
        'silver-chain': 81,
      },
      nose: {
        none: null,
        'clown-nose': 83,
      },
    },
  };
  window.ATTRIBUTES_LIST = [
    'skin',
    'blemish',
    'ear',
    'head',
    'mouth',
    'neck',
    'nose',
    'eyes',
    'facial-hair',
    'mouth-accessory',
  ];
  window.ATTRIBUTES = {
    base: [
      'male-alien',
      'male-ape',
      'male-zombie',
      'male-human-lighter',
      'male-human-light',
      'male-human-dark',
      'male-human-darker',
      'female-alien',
      'female-ape',
      'female-zombie',
      'female-human-lighter',
      'female-human-light',
      'female-human-dark',
      'female-human-darker',
    ],
    blemish: ['mole', 'rosy-cheeks', 'spots'],
    ear: ['earring'],
    eyes: [
      '3d-glasses',
      'big-shades',
      'blue-eye-shadow',
      'classic-shades',
      'clown-eyes-blue',
      'clown-eyes-green',
      'eye-mask',
      'eye-patch',
      'green-eye-shadow',
      'horned-rim-glasses',
      'nerd-glasses',
      'purple-eye-shadow',
      'regular-shades',
      'small-shades',
      'vr',
      'welding-goggles',
    ],
    'facial-hair': [
      'big-beard',
      'chinstrap',
      'front-beard',
      'front-beard-dark',
      'goat',
      'handlebars',
      'luxurious-beard',
      'mustache',
      'muttonchops',
      'normal-beard',
      'normal-beard-black',
      'shadow-beard',
    ],
    head: [
      'bandana',
      'beanie',
      'blonde-bob',
      'blonde-short',
      'cap',
      'cap-forward',
      'clown-hair-green',
      'cowboy-hat',
      'crazy-hair',
      'dark-hair',
      'do-rag',
      'fedora',
      'frumpy-hair',
      'half-shaved',
      'headband',
      'hoodie',
      'knitted-cap',
      'messy-hair',
      'mohawk',
      'mohawk-dark',
      'mohawk-thin',
      'orange-side',
      'peak-spike',
      'pigtails',
      'pilot-helmet',
      'pink-with-hat',
      'police-cap',
      'purple-hair',
      'red-mohawk',
      'shaved-head',
      'straight-hair',
      'straight-hair-blonde',
      'straight-hair-dark',
      'stringy-hair',
      'tassle-hat',
      'tiara',
      'top-hat',
      'vampire-hair',
      'wild-blonde',
      'wild-hair',
      'wild-white-hair',
    ],
    mouth: ['black-lipstick', 'buck-teeth', 'frown', 'hot-lipstick', 'purple-lipstick', 'smile'],
    'mouth-accessory': ['cigarette', 'pipe', 'vape', 'medical-mask'],
    neck: ['choker', 'gold-chain', 'silver-chain'],
    nose: ['clown-nose'],
  };
  // methods
  window.isValidTokenId = tokenId => {
    let result = false;
    if (!isNaN(tokenId)) {
      tokenId = parseInt(tokenId);
      tokenId -= ORIGINAL_PUNKS_SUPPLY;
      result = 0 <= tokenId && tokenId < TOTAl_SUPPLY.MALE + TOTAl_SUPPLY.FEMALE;
    }
    return result;
  };
  window.labelize = value => {
    if (value) {
      return value.replace(/-/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    } else {
      return '';
    }
  };
  window.getTokenId = metadata => {
    const g = metadata.gender;
    let tokenId = g === 'female' ? TOTAl_SUPPLY.MALE : 0;
    const genderAttributes = window.SPRITES[g];
    const genderAttributesList = Object.keys(window.SPRITES[g]).sort(sortAtributes);
    let currentBase = 1;
    for (let i = genderAttributesList.length - 1; i >= 0; i--) {
      const attrName = genderAttributesList[i];
      const attrValue = metadata[attrName] || 'none';
      const attrValueList = Object.keys(genderAttributes[attrName]).sort(sortAttributeValue);
      const attrValueIndex = attrValueList.indexOf(attrValue || null);
      if (attrValueIndex < 0) {
        throw new Error(`"${attrValue}" is not a valid value for attribute "${attrName}"`);
      } else {
        tokenId += attrValueIndex * currentBase;
        const attrBase = attrValueList.length;
        currentBase = currentBase * attrBase;
      }
    }
    return tokenId + ORIGINAL_PUNKS_SUPPLY;
  };
  window.getPunkFromTokenId = tokenId => {
    tokenId -= ORIGINAL_PUNKS_SUPPLY;
    const punk = { gender: null };
    if (tokenId < TOTAl_SUPPLY.MALE) {
      punk.gender = 'male';
    } else {
      punk.gender = 'female';
      tokenId -= TOTAl_SUPPLY.MALE;
    }
    const g = punk.gender;
    const genderAttributes = window.SPRITES[g];
    const genderAttributesList = Object.keys(window.SPRITES[g]).sort(sortAtributes);
    const effectiveBasePerAttribute = [];
    let currentBase = 1;
    for (let i = genderAttributesList.length - 1; i >= 0; i--) {
      const attrName = genderAttributesList[i];
      const attrValueList = Object.keys(genderAttributes[attrName]);
      const attrBase = attrValueList.length;
      effectiveBasePerAttribute.unshift(currentBase);
      currentBase = currentBase * attrBase;
    }

    for (let i = 0; i < genderAttributesList.length; i++) {
      const attrName = genderAttributesList[i];
      const attrEffectiveBase = effectiveBasePerAttribute[i];
      const attrValueIndex = Math.floor(tokenId / attrEffectiveBase);
      const attrValueList = Object.keys(genderAttributes[attrName]).sort(sortAttributeValue);
      punk[attrName] = attrValueList[attrValueIndex];
      punk[attrName] === 'none' && (punk[attrName] = null);
      tokenId -= attrValueIndex * attrEffectiveBase;
    }
    return punk;
  };
})(typeof window === 'undefined' ? module.exports : window);
