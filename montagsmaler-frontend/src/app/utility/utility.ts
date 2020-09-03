export const getRandomColor = (inputNumber: number): string => {
  const random = inputNumber % 7;
  switch (random) {
    case 0:
      return '#00D5B9';
    case 1:
      return '#E2B236';
    case 3:
      return '#E1325B';
    case 2:
      return '#028DCB';
    case 4:
      return '#F47E4A';
    case 5:
      return '#4A86F4';
    case 6:
      return '#F48B4A';
  }
};

export const copyToClipboard = (val: string): void => {
  const selBox = document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  selBox.value = val;
  document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();
  document.execCommand('copy');
  document.body.removeChild(selBox);
};

export const hashCodeFromString = (str: string): number => {
  let hash = 0;
  console.log(hash);

  for (let i = 0; i < 20; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  console.log(hash);

  return hash;
};


