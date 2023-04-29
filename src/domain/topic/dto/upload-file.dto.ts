import { IsEnum, IsNotEmpty } from 'class-validator';
import { FileTypeEnum, fileTypeEnum } from 'src/domain/topic/constant/file-type.enum';

export class UploadFileDto {
  @IsNotEmpty()
  @IsEnum(fileTypeEnum)
  type!: FileTypeEnum;
}
