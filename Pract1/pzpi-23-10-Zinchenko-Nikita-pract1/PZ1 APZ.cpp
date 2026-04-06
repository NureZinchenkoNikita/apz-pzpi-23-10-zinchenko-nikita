/*
Метологічна довідка про використання ШІ
    1. Назва інструменту та версія: Gemini Advanced.
    2. Мета використання: Консультація щодо структури 
патерну Builder, допомога в адаптації абстрактного прикладу з книги GoF 
у компільований код (додавання базових класів Room, Door та логування).
    3. Внесок автора: Самостійне визначення архітектури згідно із завданням, 
аналіз запропонованого коду, перевірка його на відповідність побудованої 
UML-діаграмі та фінальне тестування працездатності програми.
*/

#include <iostream>
#include <map>

using namespace std;


// компоненти продукту

class Room {
    int roomNumber;
public:
    Room(int n) : roomNumber(n) {
        cout << "  [Room] Створено кімнату #" << n << "\n";
    }
    int GetRoomNo() { 
        return roomNumber; 
    }
};

class Door {
public:
    Door(Room* r1, Room* r2) {
        cout << "  [Door] Створено двері між кімнатами #"
            << r1->GetRoomNo() << " та #" << r2->GetRoomNo() << "\n";
    }
};

// продукт (кінцевий складний об'єкт)

class Maze {
    map<int, Room*> rooms;
public:
    Maze() {
        cout << "[Maze] Створено новий порожній лабіринт.\n";
    }

    void AddRoom(Room* r) {
        rooms[r->GetRoomNo()] = r;
    }

    // пошук кімнати за номером
    Room* RoomNo(int n) {
        if (rooms.count(n)) return rooms[n];
        return nullptr;
    }
};

//інтерфейс будівельника

class MazeBuilder {
public:
    virtual void BuildMaze() {}
    virtual void BuildRoom(int room) {}
    virtual void BuildDoor(int roomFrom, int roomTo) {}
    virtual Maze* GetMaze() { return nullptr; }
    virtual ~MazeBuilder() = default;
protected:
    MazeBuilder() {}
};


// конкретний будівельник

class StandardMazeBuilder : public MazeBuilder {
private:
    Maze* _currentMaze; // внутрішнє представлення продукту
public:
    StandardMazeBuilder() { _currentMaze = nullptr; }

    void BuildMaze() override {
        _currentMaze = new Maze();
    }

    void BuildRoom(int n) override {
        // перевірка чи немає вже такої кімнати
        if (!_currentMaze->RoomNo(n)) {
            Room* room = new Room(n);
            _currentMaze->AddRoom(room);
            cout << "  [Builder] Стіни для кімнати #" << n << " зведені.\n";
        }
    }

    void BuildDoor(int n1, int n2) override {
        Room* r1 = _currentMaze->RoomNo(n1);
        Room* r2 = _currentMaze->RoomNo(n2);

        // будуємо двері якщо 2 кімнати існують
        if (r1 && r2) {
            Door* d = new Door(r1, r2);
            cout << "  [Builder] Двері успішно встановлені.\n";
        }
    }

    Maze* GetMaze() override {
        return _currentMaze;
    }
};

//керівник

class MazeGame {
public:
    // метод який приймає абстрактного будівельника
    Maze* CreateMaze(MazeBuilder& builder) {
        cout << "=== Директор починає збірку лабіринту ===\n";

        builder.BuildMaze();
        builder.BuildRoom(1);
        builder.BuildRoom(2);
        builder.BuildDoor(1, 2);

        cout << "=== Директор закінчив збірку ===\n";
        return builder.GetMaze();
    }
};

// демонстрація

int main() {

    setlocale(LC_ALL, "uk_UA.UTF-8");

    MazeGame game;                 // створюємо керівника
    StandardMazeBuilder builder;   // створюємо конкретного будівельника

    // керівник покроково конструює лабіринт
    Maze* maze = game.CreateMaze(builder);

    if (maze != nullptr) {
        cout << "Клієнт успішно отримав готовий лабіринт!\n";
    }

    return 0;
}