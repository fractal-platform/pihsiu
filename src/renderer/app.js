import log from 'loglevel';
import router from 'umi/router';
import bc from './service';

if (process.env.NODE_ENV === 'development') {
  log.setLevel('DEBUG');
}

export const dva = {
  config: {
    onError(err) {
      err.preventDefault();
      console.error(err.message);
    },
  },
};

export function render(oldRender) {
  bc.sendAsync({ type: 'pihsiu/getStatus' })
    .then(resp => {
      if (resp.error) {
        oldRender();
      } else {
        const {
          payload: { isUnlocked, isInitialized, isSeedWordsSaved },
        } = resp;
        if (!isInitialized) {
          router.push('/register');
        } else if (!isUnlocked) {
          router.push('/login');
        } else if (!isSeedWordsSaved) {
          router.push('/seed/Record');
        }
        oldRender();
      }
    })
    .catch(() => oldRender());
}
