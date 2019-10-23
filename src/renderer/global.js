import {
  AlertOutline,
  AppstoreOutline,
  CaretDownOutline,
  CaretUpOutline,
  CheckOutline,
  CloseCircleOutline,
  CloudDownloadOutline,
  ControlOutline,
  CopyOutline,
  DeleteOutline,
  DeploymentUnitOutline,
  EditOutline,
  ExclamationCircleOutline,
  ExportOutline,
  FileProtectOutline,
  HomeOutline,
  ImportOutline,
  InboxOutline,
  InteractionOutline,
  PlusCircleOutline,
  PlusOutline,
  PlusSquareOutline,
  QrcodeOutline,
  RightCircleOutline,
  RightOutline,
  SettingOutline,
  ShareAltOutline,
  UserOutline,
  WifiOutline,
} from '@ant-design/icons';
import AntdIcon from '@ant-design/icons-react';

AntdIcon.add(
  ImportOutline,
  ExportOutline,
  PlusSquareOutline,
  RightCircleOutline,
  RightOutline,
  AlertOutline,
  WifiOutline,
  SettingOutline,
  HomeOutline,
  AppstoreOutline,
  QrcodeOutline,
  CopyOutline,
  CaretDownOutline,
  ShareAltOutline,
  DeploymentUnitOutline,
  InteractionOutline,
  ControlOutline,
  InboxOutline,
  CloseCircleOutline,
  DeleteOutline,
  EditOutline,
  PlusOutline,
  CloudDownloadOutline,
  PlusCircleOutline,
  CaretUpOutline,
  CheckOutline,
  UserOutline,
  ExclamationCircleOutline,
  FileProtectOutline,
);

// init state at the very first place:
setTimeout(() => {
  if (window.g_app && window.g_app._store) {
    window.g_app._store.dispatch({
      type: 'pihsiu/fetchInitial',
    });
  }
}, 300);
