import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ExtractPaymentScreenshotDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  imageUrl: string;
}
