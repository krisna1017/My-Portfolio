import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join, basename } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

function ensureDir() {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new BadRequestException('Only image files are allowed'), false);
};

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter,
    }),
  )
  upload(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { url: `${baseUrl}/api/uploads/${file.filename}` };
  }
}

@Controller('uploads')
export class UploadsController {
  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    const safe = basename(filename);
    const filePath = join(UPLOAD_DIR, safe);
    if (!existsSync(filePath)) return res.status(404).send('Not found');
    return res.sendFile(filePath);
  }
}
