import {MigrationInterface, QueryRunner} from "typeorm";

export class scripts1699867902762 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`insert into param_type(id, name) values(1, 'Токен')`);
        await queryRunner.query(`insert into param_type(id, name) values(2, 'Логин')`);
        await queryRunner.query(`insert into param_type(id, name, is_hidden) values(3, 'Пароль', true)`);
        await queryRunner.query(`insert into param_type(id, name) values(4, 'EMail')`);
        await queryRunner.query(`insert into param_type(id, name) values(5, 'URL')`);
        await queryRunner.query(`insert into param_type(id, name) values(6, 'SID')`);
        await queryRunner.query(`insert into param_type(id, name) values(7, 'LOCALE')`);
        await queryRunner.query(`insert into param_type(id, name) values(8, 'DATA')`);
        await queryRunner.query(`insert into param_type(id, name) values(9, 'PLAYER')`);
        await queryRunner.query(`insert into param_type(id, name) values(11, 'LINK')`);

        await queryRunner.query(`insert into script(id, name) values(1, 'Уведомление об ожидании хода')`);
        await queryRunner.query(`insert into script(id, name) values(2, 'Account registration', 'start')`);
        await queryRunner.query(`insert into script(id, name, command) values(3, 'English', 'en')`);
        await queryRunner.query(`insert into script(id, name, command) values(4, 'Russian', 'ru')`);
        await queryRunner.query(`insert into script(id, name, command) values(5, 'Enter to Dagaz', 'enter')`);

        await queryRunner.query(`insert into script_param(id, script_id, paramtype_id, order_num) values(1, 5, 2, 1)`);

        await queryRunner.query(`insert into action_type(id, name) values(1, 'Вывод текста')`);
        await queryRunner.query(`insert into action_type(id, name) values(2, 'Ввод текста')`);
        await queryRunner.query(`insert into action_type(id, name) values(3, 'Меню')`);
        await queryRunner.query(`insert into action_type(id, name) values(4, 'Пункт меню')`);
        await queryRunner.query(`insert into action_type(id, name) values(5, 'Изменение переменной')`);
        await queryRunner.query(`insert into action_type(id, name) values(6, 'Динамическое меню')`);
        await queryRunner.query(`insert into action_type(id, name) values(10, 'Создать учётную запись на DagazServer')`);
        await queryRunner.query(`insert into action_type(id, name) values(11, 'Авторизоваться на DagazServer')`);
        await queryRunner.query(`insert into action_type(id, name) values(12, 'Связать пользователя с учётной записью')`);
        await queryRunner.query(`insert into action_type(id, name) values(13, 'Перейти к игре')`);
        await queryRunner.query(`insert into action_type(id, name) values(14, 'Проверить username')`);
        await queryRunner.query(`insert into action_type(id, name) values(15, 'Запросить тикет')`);
        await queryRunner.query(`insert into action_type(id, name) values(16, 'Получить url для входа на сервер')`);
        await queryRunner.query(`insert into action_type(id, name) values(17, 'Получить url для входа в игру')`);

        await queryRunner.query(`insert into request(id, server_id, actiontype_id, url, request_type) values(1, 2, 10, '/auth/user', 'POST')`);
        await queryRunner.query(`insert into request(id, server_id, actiontype_id, url, request_type) values(2, 2, 11, '/auth/login', 'POST')`);
        await queryRunner.query(`insert into request(id, server_id, url, request_type) values(3, 2, '/session/notify', 'GET')`);
        await queryRunner.query(`insert into request(id, server_id, actiontype_id, url, request_type) values(4, 2, 15, '/auth/ticket', 'POST')`);

        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(1, 1, 2, 'name')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(2, 1, 2, 'username')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(3, 1, 3, 'password')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(4, 1, 4, 'email')`);
        await queryRunner.query(`insert into request_param(id, request_id, param_name, param_value) values(7, 1, 4, 'device', 'telegram')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(5, 2, 2, 'username')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(6, 2, 3, 'password')`);
        await queryRunner.query(`insert into request_param(id, request_id, param_name, param_value) values(8, 2, 4, 'device', 'telegram')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(9, 4, 2, 'username')`);
        await queryRunner.query(`insert into request_param(id, request_id, paramtype_id, param_name) values(10, 4, 3, 'password')`);

        await queryRunner.query(`insert into dbproc(id, actiontype_id, name) values(1, 12, 'createAccount')`);
        await queryRunner.query(`insert into dbproc(id, actiontype_id, name) values(2, 14, 'chooseAccount')`);
        await queryRunner.query(`insert into dbproc(id, actiontype_id, name) values(3, 16, 'enterUrl')`);
        await queryRunner.query(`insert into dbproc(id, name) values(4, 'getNotify')`);
        await queryRunner.query(`insert into dbproc(id, actiontype_id, name) values(5, 17, 'gameUrl')`);

        await queryRunner.query(`insert into db_param(id, proc_id, value, order_num) values(1, 1, '2', 2)`);
        await queryRunner.query(`insert into db_param(id, proc_id, paramtype_id, order_num) values(2, 2, 2, 2)`);
        await queryRunner.query(`insert into db_param(id, proc_id, value, order_num) values(3, 2, '2', 3)`);
        await queryRunner.query(`insert into db_param(id, proc_id, value, order_num) values(4, 3, '2', 2)`);

        await queryRunner.query(`insert into db_result(id, proc_id, name) values(1, 2, 'result')`);
        await queryRunner.query(`insert into db_result(id, proc_id, name, paramtype_id) values(2, 2, 'login', 2)`);
        await queryRunner.query(`insert into db_result(id, proc_id, name, paramtype_id) values(3, 2, 'password', 3)`);
        await queryRunner.query(`insert into db_result(id, proc_id, name) values(4, 3, 'result')`);
        await queryRunner.query(`insert into db_result(id, proc_id, name, paramtype_id) values(5, 3, 'url', 11)`);

        await queryRunner.query(`insert into job(id, name, request_id, proc_id) values(1, 'notify', 3, 4)`);

        await queryRunner.query(`insert into action(id, script_id, type_id, order_num) values(201, 2, 3, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, order_num) values(202, 2, 201, 4, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, order_num) values(203, 2, 201, 4, 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(204, 2, 202, 2, 2, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(205, 2, 202, 2, 3, 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(206, 2, 202, 2, 4, 3)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, order_num) values(207, 2, 202, 10, 4)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(208, 2, 207, 12, 5, 1)`); // 201
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, follow_to, order_num) values(210, 2, 207, 1, 201, 2)`); // 409
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id paramtype_id, order_num) values(211, 2, 203, 2, 2, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(212, 2, 203, 2, 3, 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, order_num) values(213, 2, 203, 11, 3)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(214, 2, 213, 12, 5, 1)`); // 200
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, follow_to, order_num) values(216, 2, 213, 1, 201, 2)`); // 401
        await queryRunner.query(`insert into action(id, script_id, type_id, paramtype_id, order_num) values(101, 1, 15, 11, 1)`);
        await queryRunner.query(`insert into action(id, script_id, type_id, order_num) values(102, 2, 17, 2)`);
        await queryRunner.query(`insert into action(id, script_id, type_id, order_num) values(103, 1, 1, 3)`);
        await queryRunner.query(`insert into action(id, script_id, type_id, paramtype_id, order_num) values(301, 3, 5, 7, 1)`);
        await queryRunner.query(`insert into action(id, script_id, type_id, order_num) values(302, 3, 1, 2)`);
        await queryRunner.query(`insert into action(id, script_id, type_id, paramtype_id, order_num) values(401, 4, 5, 7, 1)`);
        await queryRunner.query(`insert into action(id, script_id, type_id, order_num) values(402, 4, 1, 2)`);
        await queryRunner.query(`insert into action(id, script_id, type_id, order_num) values(501, 5, 14, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, follow_to, order_num) values(502, 5, 501, 1, 201, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(503, 5, 501, 15, 11, 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, order_num) values(504, 5, 503, 16, 1)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, order_num) values(506, 5, 504, 1, 11, 2)`);
        await queryRunner.query(`insert into action(id, script_id, parent_id, type_id, paramtype_id, follow_to, order_num) values(505, 5, 501, 6, 2, 501, 3)`);

        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(103, 'ru', '{PLAYER} ожидает вашего хода: {LINK}')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(103, 'en', '{PLAYER} awaits your move: {LINK}')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(201, 'ru', 'Выберите действие для регистрации на DagazServer')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(201, 'en', 'Choose an action to register on the DagazServer')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(202, 'ru', 'Создать учётную запись')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(202, 'en', 'Create an account')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(203, 'ru', 'Подключить учётную запись')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(203, 'en', 'Connect your account')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(204, 'ru', 'Введите логин:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(204, 'en', 'Enter Login:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(205, 'ru', 'Введите пароль:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(205, 'en', 'Enter Password:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(206, 'ru', 'Введите EMail:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(206, 'en', 'Enter EMail:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(210, 'ru', 'Учётная запись с таким именем уже существует')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(210, 'en', 'An account with the same name already exists')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(211, 'ru', 'Введите логин:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(211, 'en', 'Enter Login:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(212, 'ru', 'Введите пароль:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(212, 'en', 'Enter Password:')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(216, 'ru', 'Неверный логин или пароль')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(216, 'en', 'Wrong login or password')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(301, 'en', 'en')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(302, 'en', 'Language configured: English')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(401, 'en', 'ru')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(402, 'ru', 'Язык сконфигурирован: Русский')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(502, 'ru', 'Учётная запись не найдена')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(502, 'en', 'Account not found')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(506, 'ru', 'Перейдите по ссылке на DagazServer: {LINK}')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(506, 'en', 'Follow the link to DagazServer: {LINK}')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(505, 'ru', 'Выберите учётную запись')`);
        await queryRunner.query(`insert into localized_string(action_id, locale, message) values(505, 'en', 'Choose an account')`);

        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(1, 1, 200, 1)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(2, 1, 400, 2)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(3, 2, 201, 1)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(4, 2, 401, 2)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(5, 3, 200, 1)`);
        await queryRunner.query(`insert into response(id, request_id, result_code, order_num) values(6, 4, 200, 1)`);

        await queryRunner.query(`insert into response_param(id, response_id, paramtype_id, param_name) values(1, 1, 1, 'access_token')`);
        await queryRunner.query(`insert into response_param(id, response_id, paramtype_id, param_name) values(2, 3, 1, 'access_token')`);
        await queryRunner.query(`insert into response_param(id, response_id, paramtype_id, param_name) values(3, 5, 6, 'sid')`);
        await queryRunner.query(`insert into response_param(id, response_id, paramtype_id, param_name) values(4, 6, 11, 'ticket')`);

        await queryRunner.query(`insert into db_action(id, result_id, result_value, order_num, action_id) values(1, 1, '0', 1, 502)`);
        await queryRunner.query(`insert into db_action(id, result_id, result_value, order_num, action_id) values(2, 1, '1', 2, 503)`);
        await queryRunner.query(`insert into db_action(id, result_id, result_value, order_num, action_id) values(3, 1, '2', 3, 505)`);
        await queryRunner.query(`insert into db_action(id, result_id, result_value, order_num, action_id) values(4, 4, '1', 1, 506)`);

        await queryRunner.query(`insert into watch_type(id, name) values(1, 'Следить за игрой')`);
        await queryRunner.query(`insert into watch_type(id, name) values(2, 'Следить за игроком')`);
        await queryRunner.query(`insert into watch_type(id, name) values(3, 'Не следить за игрой')`);
        await queryRunner.query(`insert into watch_type(id, name) values(4, 'Не следить за игроком')`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`delete from watch_type`);
        await queryRunner.query(`delete from db_action`);
        await queryRunner.query(`delete from response_param`);
        await queryRunner.query(`delete from response`);
        await queryRunner.query(`delete from localized_string`);
        await queryRunner.query(`delete from action`);
        await queryRunner.query(`delete from job`);
        await queryRunner.query(`delete from db_result`);
        await queryRunner.query(`delete from db_param`);
        await queryRunner.query(`delete from dbproc`);
        await queryRunner.query(`delete from request_param`);
        await queryRunner.query(`delete from request`);
        await queryRunner.query(`delete from action_type`);
        await queryRunner.query(`delete from script_param`);
        await queryRunner.query(`delete from script`);
        await queryRunner.query(`delete from param_type`);
    }
}
