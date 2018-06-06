import Service from '../common/baseService';

class check extends Service {
  index() {
    return 2 + 3;
  }
}

module.exports = check;
