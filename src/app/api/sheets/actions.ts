'use server';

import { GoogleDriveService } from '@/services/googleDrive';

const service = GoogleDriveService.getInstance();

export async function readSheetData() {
  await service.initialize();
  return service.readData();
}

export async function appendSheetData(values: any[][]) {
  await service.initialize();
  await service.appendData(values);
  return service.readData();
}

export async function updateSheetData(range: string, values: any[][]) {
  await service.initialize();
  await service.updateData(range, values);
  return service.readData();
}
