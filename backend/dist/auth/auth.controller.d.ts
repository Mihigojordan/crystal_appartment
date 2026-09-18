import type { Request } from 'express';
import { AuthService } from './auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getMe(req: Request): {
        id?: string | undefined;
        name?: string | undefined;
        email?: string | undefined;
        role?: string | undefined;
        department?: string;
        phone?: string;
        status?: string;
        officeLocation?: string;
        bio?: string;
        uid?: string | undefined;
    };
    updateMe(req: Request, dto: UpdateProfileDto): Promise<import("./firebase-auth.guard").AdminProfile>;
}
