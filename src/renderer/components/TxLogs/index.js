import { Steps } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';

export default function TxLogs(props) {
  const { history } = props;

  const steps = [
    <Steps.Step key={1} title="Creating" description="wait for processing ..." />,
    <Steps.Step key={2} title="Confirming" description="wait for processing ..." />,
    <Steps.Step key={3} title="Receipting" description="wait for processing ..." />,
  ];

  let logs = [];
  let status = 'process';

  for (let i = 0; i < Math.min(3, history.length); i++) {
    logs[i] = {
      title: formatMessage({ id: history[i].op }),
      description: new Date(history[i].timestamp).toLocaleString(),
    };

    if (['receipt', 'timeout', 'failed'].includes(history[i].op)) {
      status = history[i].op === 'receipt' ? 'finish' : 'error';
      break;
    }
  }

  logs.forEach((log, i) => {
    steps[i] = <Steps.Step key={i} title={log.title} description={log.description} />;
  });

  return (
    <Steps size="small" current={Math.min(3, logs.length)} status={status}>
      {steps}
    </Steps>
  );
}
