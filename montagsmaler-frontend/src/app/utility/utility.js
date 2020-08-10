export const  getRandomColor = (inputNumber) => {
    const random = inputNumber % 7;
    switch (random) {
      case 0:
        return '#00D5B9';
      case 1:
        return '#E2B236';
      case 2:
        return '#E1325B';
      case 3:
        return '#028DCB';
      case 4:
        return '#F47E4A';
      case 5:
        return '#4A86F4';
      case 6:
        return '#F48B4A';
    }
  }
