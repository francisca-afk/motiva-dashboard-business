// lib/business-constants.js

export const SECTOR_OPTIONS = [
    { value: 'technology', label: '💻 Technology' },
    { value: 'retail', label: '🛍️ Retail' },
    { value: 'healthcare', label: '🏥 Healthcare' },
    { value: 'education', label: '📚 Education' },
    { value: 'finance', label: '💰 Finance' },
    { value: 'hospitality', label: '🏨 Hospitality' },
    { value: 'real-estate', label: '🏢 Real Estate' },
    { value: 'other', label: '✨ Other' }
  ];
  
  export const TONE_OPTIONS = [
    { value: 'friendly', label: '😊 Friendly' },
    { value: 'formal', label: '👔 Formal' },
    { value: 'technical', label: '🔧 Technical' }
  ];
  
  export const getToneIcon = (tone) => {
    switch (tone) {
      case 'friendly': return '😊';
      case 'formal': return '👔';
      case 'technical': return '🔧';
      default: return '💬';
    }
  };
  
  export const getSectorIcon = (sector) => {
    const option = SECTOR_OPTIONS.find(opt => opt.value === sector);
    return option ? option.label.split(' ')[0] : '🏢';
  };
  
  export const getSectorLabel = (sector) => {
    const option = SECTOR_OPTIONS.find(opt => opt.value === sector);
    return option ? option.label.split(' ').slice(1).join(' ') : 'Other';
  };
  
  export const FORM_STEPS = [
    { number: 1, title: 'Basic Info', icon: 'Building2' },
    { number: 2, title: 'Contact & Alerts', icon: 'Mail' },
    { number: 3, title: 'Chatbot Settings', icon: 'MessageSquare' }
  ];