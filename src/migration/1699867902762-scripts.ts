import {MigrationInterface, QueryRunner} from "typeorm";

export class scripts1699867902762 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`insert into param_type(id, name) values(1, 'Токен')`);
        await queryRunner.query(`insert into param_type(id, name) values(2, 'Логин')`);
        await queryRunner.query(`insert into param_type(id, name) values(3, 'Пароль')`);
        await queryRunner.query(`insert into param_type(id, name) values(4, 'EMail')`);
        await queryRunner.query(`insert into param_type(id, name) values(5, 'URL')`);
        await queryRunner.query(`insert into param_type(id, name) values(6, 'SID')`);

        await queryRunner.query(`insert into script(id, name) values(1, 'Уведомление об ожидании хода')`);
        await queryRunner.query(`insert into script(id, name) values(2, 'Регистрация учётной записи в DagazServer')`);

        await queryRunner.query(`insert into request(id, server_id, url, request_type) values(1, 2, '/users', 'POST')`); // name, username, password, email -> 201 (TOKEN), 409
        await queryRunner.query(`insert into request(id, server_id, url, request_type) values(2, 2, '/auth/login', 'POST')`); // username, password -> 200 (TOKEN), 401
        await queryRunner.query(`insert into request(id, server_id, url, request_type) values(3, 2, '/session/notify', 'GET')`); // -> 200 [SID]

        await queryRunner.query(`insert into action_type(id, name) values(1, 'Вывод текста')`);
        await queryRunner.query(`insert into action_type(id, name) values(2, 'Ввод текста')`);
        await queryRunner.query(`insert into action_type(id, name) values(3, 'Меню')`);
        await queryRunner.query(`insert into action_type(id, name) values(4, 'Пункт меню')`);
        await queryRunner.query(`insert into action_type(id, name, request_id) values(10, 'Создать учётную запись на DagazServer', 1)`);
        await queryRunner.query(`insert into action_type(id, name, request_id) values(11, 'Авторизоваться на DagazServer', 2)`);
        await queryRunner.query(`insert into action_type(id, name) values(12, 'Связать пользователя с учётной записью')`); // Сформировать URL перехода с авторизацией
        await queryRunner.query(`insert into action_type(id, name) values(13, 'Перейти к игре')`); // Сформировать URL для перехода на игру по SID (с авторизацией)

        await queryRunner.query(`insert into action(id, script_id, type_id, message, order_num) values(201, 2, 3, 'Для регистрации на DagazServer выберите одно из следующих действий', 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, order_num) values(202, 2, 201, 4, 'Создать учётную запись', 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, order_num) values(203, 2, 201, 4, 'Подключить учётную запись', 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, paramtype_id, order_num) values(204, 2, 202, 2, 'Введите логин:', 2, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, paramtype_id, order_num) values(205, 2, 202, 2, 'Введите пароль:', 3, 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, paramtype_id, order_num) values(206, 2, 202, 2, 'Введите EMail (не обязательно):', 4, 3)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, order_num) values(207, 2, 202, 10, 4)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(208, 2, 207, 12, 5, 1)`); // 201
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, paramtype_id, order_num) values(209, 2, 208, 1, 'Для входа на DagazServer перейдите по ссылке:', 5, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, follow_to, order_num) values(210, 1, 207, 1, 'На DagazServer уже существует учётная запись с таким именем', 201, 2)`); // 409
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, paramtype_id, order_num) values(211, 2, 203, 2, 'Введите логин:', 2, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, paramtype_id, order_num) values(212, 2, 203, 2, 'Введите пароль:', 3, 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, order_num) values(213, 2, 203, 11, 3)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(214, 2, 213, 12, 5, 1)`); // 200
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, paramtype_id, order_num) values(215, 2, 214, 1, 'Для входа на DagazServer перейдите по ссылке:', 5, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, follow_to, order_num) values(216, 1, 213, 1, 'Неверный логин или пароль', 201, 2)`); // 401
        await queryRunner.query(`insert into action(id, script_id, type_id, order_num) values(101, 1, 11, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(102, 1, 101, 12, 5, 1)`); // 200
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(103, 1, 102, 13, 5, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, paramtype_id, order_num) values(104, 1, 102, 1, 'Для входа в игру перейдите по ссылке:', 5, 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, message, follow_to, order_num) values(105, 1, 101, 1, 'Не удалось авторизоваться на DagazServer', 201, 2)`); // 409

        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(1, 1, 201, 1)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(2, 1, 409, 2)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(3, 2, 200, 1)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(4, 2, 401, 2)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(5, 3, 200, 1)`);

        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(1, 1, 2, 'name')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(2, 1, 2, 'username')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(3, 1, 3, 'password')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(4, 1, 4, 'email')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(5, 2, 2, 'username')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(6, 2, 3, 'password')`);

        await queryRunner.query(`insert into response_param(id, response_id, paramtype_id, param_name) values(1, 1, 1, 'token')`);
        await queryRunner.query(`insert into response_param(id, response_id, paramtype_id, param_name) values(2, 2, 1, 'token')`);
        await queryRunner.query(`insert into response_param(id, response_id, paramtype_id, param_name) values(3, 3, 6, 'sid')`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`delete from response_param`);
        await queryRunner.query(`delete from request_param`);
        await queryRunner.query(`delete from response`);
        await queryRunner.query(`delete from action`);
        await queryRunner.query(`delete from action_type`);
        await queryRunner.query(`delete from request`);
        await queryRunner.query(`delete from script`);
        await queryRunner.query(`delete from param_type`);
    }
}
