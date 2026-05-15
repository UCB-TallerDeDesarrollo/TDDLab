export const ICONIFY_CONFIG = {
  collections: {
    MDI: 'mdi', 
    IC: 'ic', 
    FA: 'fa', 
    FEATHER: 'feather', 
    TABLER: 'tabler', 
    BI: 'bi', 
  },
};

export const buildIconName = (collection: string, iconName: string): string => {
  return `${collection}:${iconName}`;
};
