import { IUserConstructor } from "../interfaces";

/**
 * Класс User, представляющий пользователя.
 * @class
 */
export class User {
    public id: number;
    public user_name?: string;

    /**
     * Конструктор для создания объекта пользователя.
     * @param {IUserConstructor} param0 Объект с параметрами id и user_name.
     * @param {number} param0.id Уникальный идентификатор пользователя.
     * @param {string} [param0.user_name=''] Имя пользователя (опционально).
     */
    constructor({ id, user_name = ''}: IUserConstructor) {
        this.id = id;
        this.user_name = user_name;
    }

    /**
     * Преобразует объект User в сериализуемый объект, содержащий необходимые ключи для сохранения в базе данных.
     * @returns {Object} Объект с полями id и user_name.
     */
    toSerializableObject() {
        return {
            id: this.id,
            user_name: this.user_name
        };
    }

    /**
     * Геттер для получения ID пользователя.
     * @returns {number} ID пользователя.
     */
    public get getId(): number {
        return this.id;
    }

    /**
     * Метод для установки имени пользователя.
     * @param {string} name Новое имя пользователя.
     * @returns {string} Установленное имя пользователя.
     */
    public setUserName(name: string): string {
        return this.user_name = name;
    }
}