import { ReactElement, useRef, useState } from 'react';
import './App.css';

type UploadFile = () => Promise<void>;

export function App(): ReactElement {
  const [fileList, setFilesList] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const clearField = (): void => {
    if (inputRef.current) inputRef.current.value = '';
    setFilesList(null);
  };

  const files = fileList ? [...fileList] : [];

  const uploadFile: UploadFile = async () => {
    if (files.length === 0) return;

    files.forEach(async (file) => {
      const formData = new FormData();
      const fileName = file.name;
      formData.append(fileName, file);

      const getUploadUrl = await fetch(
        `https://cloud-api.yandex.net/v1/disk/resources/upload?path=%2F${fileName}`,
        {
          method: 'GET',
          headers: {
            Authorization: `OAuth ${import.meta.env.VITE_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!getUploadUrl.ok) {
        throw new Error(getUploadUrl.status.toString());
      }

      const uploadData = await getUploadUrl.json();
      const putFile = await fetch(`${uploadData.href}`, {
        method: 'PUT',
        headers: {
          'content-type': file.type,
          'content-length': `${file.size}`,
        },
        body: file,
      });

      if (!putFile.ok) {
        throw new Error(putFile.status.toString());
      }

      setUploadStatus('Данные загружены на Яндекс-диск успешно!');
      setTimeout(() => setUploadStatus(''), 3000);
    });

    clearField();
  };

  return (
    <>
      <div className="upload-container">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label className="upload-file">
          Выбрать файлы
          <input
            className="input-file"
            type="file"
            ref={inputRef}
            multiple
            onChange={(e) => setFilesList(e.target.files)}
          />
        </label>
        <button type="button" onClick={uploadFile}>
          Сохранить на диск
        </button>
        <button type="button" onClick={clearField}>
          Очистить
        </button>
      </div>
      <ol>
        {fileList && files.map((file) => <li key={file.name}>{file.name}</li>)}
      </ol>
      <div className="status">{uploadStatus}</div>
    </>
  );
}
