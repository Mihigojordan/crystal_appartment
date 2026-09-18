"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMessageStatusDto = exports.MESSAGE_STATUSES = void 0;
const class_validator_1 = require("class-validator");
exports.MESSAGE_STATUSES = ['New', 'Read', 'Archived'];
class UpdateMessageStatusDto {
    status;
}
exports.UpdateMessageStatusDto = UpdateMessageStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.MESSAGE_STATUSES),
    __metadata("design:type", String)
], UpdateMessageStatusDto.prototype, "status", void 0);
//# sourceMappingURL=update-message-status.dto.js.map