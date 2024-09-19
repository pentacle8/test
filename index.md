---
layout: default
title: Rust code examples
---

# 1. 目次
- [1. Must 要件](#1-must-要件)
    - [1. `unwrap()` の回避](#1-unwrap-の回避)
    - [2. 文字列連結の最適化](#2-文字列連結の最適化)
    - [3. `Option` の適切な処理](#3-option-の適切な処理)
    - [4. メモリ容量の事前予約](#4-メモリ容量の事前予約)
    - [5. 不必要なムーブを避ける](#5-不必要なムーブを避ける)
    - [6. `String`vs`&str` の使い分け](#6-stringvsstr-の使い分け)
    - [7. testアトリビュートの使用](#7-testアトリビュートの使用)
    - [8. スレッドの適切な使用](#8-スレッドの適切な使用)
- [2. Want 要件](#2-want-要件)
    - [1. `Option<String>`と`String`の比較](#1-optionstringとstringの比較)
    - [2. クロージャを使ったキャプチャ](#2-クロージャを使ったキャプチャ)
    - [3. クロージャを使った一時的な参照](#3-クロージャを使った一時的な参照)
    - [4. `iter().cloned()`を使い、必要な分だけクローンする。](#4-iterclonedを使い必要な分だけクローンする)
    - [5. メモリ容量の事前予約 その2](#5-メモリ容量の事前予約-その2)
    - [6. キャッシュの使用](#6-キャッシュの使用)
    - [7. エラー処理の最適化](#7-エラー処理の最適化)
    - [8. エラーハンドリングではboolよりResultで返す](#8-エラーハンドリングではboolよりresultで返す)
    - [9. 複数のエラーパターンの処理](#9-複数のエラーパターンの処理)
    - [10. エラーチェーンの適切な構築](#10-エラーチェーンの適切な構築)
    - [11. 構造体初期化時にフィールド名と変数名が同名なら省略可](#11-構造体初期化時にフィールド名と変数名が同名なら省略可)
    - [12. `ok_or` より `ok_or_else`](#12-ok_or-より-ok_or_else)
    - [13. `Vec`を参照で渡すなら`&Vec<T>`よりもスライス`&[T]`が良い](#13-vecを参照で渡すならvectよりもスライスtが良い)
    - [14. パス操作の最適化](#14-パス操作の最適化)
    - [15. ファイルIOのバッファリング](#15-ファイルioのバッファリング)
    - [16. `Option::map_or`の利用](#16-optionmap_orの利用)
    - [17. スマートポインタの活用](#17-スマートポインタの活用)
    - [18. `Mutex` と `Condvar` の連携](#18-mutex-と-condvar-の連携)
    - [19. 明示的なメモリ開放](#19-明示的なメモリ開放)
    - [20. タイムアウト付きの操作](#20-タイムアウト付きの操作)
    - [21. ループ内で不必要に複数回実行される処理](#21-ループ内で不必要に複数回実行される処理)
- [3. Conditional 要件](#3-conditional-要件)
    - [1. Defaultトレイト実装](#1-defaultトレイト実装)
    - [2. `Copy`, `Clone`トレイト実装](#2-copy-cloneトレイト実装)
- [4. リンク集](#4-リンク集)
    - [まずはここから!!](#まずはここから)
    - [まとめサイト](#まとめサイト)
    - [学習](#学習)
    - [他言語で慣れている方向け](#他言語で慣れている方向け)
    - [パフォーマンス](#パフォーマンス)
    - [環境](#環境)

<!-- Template ---------------------------------------------------->
<!---------------------------------------------------------------->

<!-- 

## N. 





### 良い例

   ```rust
   
   ```





### 悪い例

   ```rust

   ```

 -->

<!---------------------------------------------------------------->
<!-- Template ---------------------------------------------------->


# 1. Must 要件

## 1. `unwrap()` の回避
`unwrap()`は`Option`型なら`None`の場合、`Result`型なら`Err`の場合にpanic!になりプログラムを強制終了します。<br>
`unwrap()`を使用すると、明示的にエラーハンドリングをスキップすることを意味しています。

### 参考
1. [Rustのnull安全性におけるunwrap(), unsafe()](https://zenn.dev/hajimari/articles/37775311fbdbaa)
2. [RustでNoneやエラーに対してデフォルト値・任意の値を返す](https://rs.nkmk.me/rust-unwrap-or-default-else/)


### 良い例
`unwrap_or()`, `unwrap_or_default()`, `unwrap_or_else()`を使う

   ```rust
    // unwrap_or
    let value = some_option.unwrap_or(10);

    // unwrap_or_default
    let value = some_option.unwrap_or_default();

    // unwrap_or_else
    let value = some_option.unwrap_or_else(|| {
        // ここでデフォルト値を計算するロジックを記述可能
        let default_value = 20;
        default_value
    });
   ```





### 悪い例
`unwrap()`を使う

   ```rust
    // unwrap
    let value = some_option.unwrap();
   ```



<!---------------------------------------------------------------->



## 2. 文字列連結の最適化
`format!`は新しい文字列を生成するため、元の文字列は変更されません。<br>
反対に、悪い例のように演算子を用いた場合、`s1`はムーブされてしまい、**以降使用できなくなります。**  <br>
また、`+`演算子を使うたびに新しい文字列が生成されるため、**メモリ効率が悪くなります。**<br>

### 参考
1. [Rust: 何だかピンと来ないRustの文字周り事情…](https://note.com/marupeke296/n/n9b69cc5b45d4)





### 良い例
`format!`を使い、文字列を連結する
   ```rust
    fn main() {
        let s1 = String::from("Hello");
        let s2 = String::from("World");
        let s3 = format!("{} {}", s1, s2);
        println!("{}", s3); // Hello World
    }
   ```




### 悪い例
演算子を多用して文字列を連結する<br> 
   ```rust
    fn main() {
        let s1 = String::from("Hello");
        let s2 = String::from("World");
        let s3 = s1 + " " + &s2;
        println!("{}", s3); // Hello World
    }
   ```


<!---------------------------------------------------------------->



## 3. `Option` の適切な処理
`unwrap_or_default()`は便利でよく使いますが、全てのOption型に対して行うのはよくありません。<br>
文字列のparseなど、その他下記に当てはまる場合は適切にエラーハンドリングをするべきです。
1. エラーの詳細を知りたい場合<br>
2. デフォルト値が適切でない場合<br>
3. エラーのリカバリーが必要な場合 ( ネットワークやDBアクセスなど )<br>
4. ユーザーにエラーを通知する必要がある場合<br>

### 参考
1. [Rust のエラーハンドリングはシンタックスシュガーが豊富で完全に初見殺しなので自信を持って使えるように整理してみたら完全に理解した](https://qiita.com/nirasan/items/321e7cc42e0e0f238254)<br>





### 良い例
適切にエラー処理を行う

   ```rust
    let strings = vec!["1", "2", "three", "4"];
    let numbers: Vec<Result<i32, _>> = strings.iter().map(|s| s.parse::<i32>()).collect();
    for result in numbers {
        match result {
            Ok(n) => println!("Parsed number: {}", n),
            Err(e) => println!("Failed to parse: {}", e),
        }
    }
   ```





### 悪い例
なんでも`unwrap_or_default()`を使う<br>
   ```rust
    let strings = vec!["1", "2", "three", "4"];
    let numbers: Vec<i32> = strings.iter().map(|s| s.parse::<i32>().unwrap_or_default()).collect();
    println!("{:?}", numbers); // [1, 2, 0, 4]
   ```



<!---------------------------------------------------------------->



## 4. メモリ容量の事前予約
Rustに限りませんが、capacityが事前にわかる場合は容量を予約した方がパフォーマンスを向上できます。<br>
また、不必要に大きい範囲で取得するとメモリ不足、パフォーマンス低下の可能性があるのでご注意ください。

### 参考
1. [RustでVec, Stringのcapacityを取得・追加・縮小](https://rs.nkmk.me/rust-vec-string-capacity/#h2_4)
2. [Rust のパフォーマンスに何が影響を与えているのか](https://qiita.com/benki/items/ee14ee6cb9f209a080e1)





### 良い例
Vec::with_capacity を使って必要なメモリ容量を事前に予約する。
   ```rust
    let size = 10;
    let mut vec = Vec::with_capacity(size);
    for i in 0..size {
        vec.push(i);
    }
   ```





### 悪い例
容量を事前に確保せず、頻繁にメモリ再割り当てが発生する。
   ```rust
    let size = 10;
    let mut vec = Vec::new();
    for i in 0..size {
        vec.push(i); // 必要に応じて何度もメモリを再割り当て
    }
   ```



<!---------------------------------------------------------------->



## 5. 不必要なムーブを避ける
ムーブ操作はメモリのコピーを伴うため、パフォーマンスに影響します。<br>
また所有権も移動されるため予期しない動作やバグの原因となることがあります。<br>
値を別々に保持する必要がない場合は、可能な限り借用を使いましょう。

### 参考
1. [【Rust】借用と参照、ライフタイム](https://isub.co.jp/rust/rust-borrow-lifetime/)




### 良い例
可能な限り値を借用し、ムーブを避ける。

   ```rust
    fn print_value(value: &i32) {
        println!("{}", value);
    }
    let value = 10;
    print_value(&value);
   ```





### 悪い例
値を不必要にムーブする。

   ```rust
    fn print_value(value: i32) {
        println!("{}", value);
    }
    let value = 10;
    print_value(value); // ムーブが発生
   ```



<!---------------------------------------------------------------->



## 6. `String`vs`&str` の使い分け
関数の引数において、文字列の場合は`String`の代わりに`&str`を使うことで、値を参照し、無駄なメモリ確保が起きません。<br>
文字列以外にも参照`&`をとることで、ムーブが起きず無駄な`clone()`がなくなります。

### 参考
1. [Rustの構造体に文字列を持たせるいくつかの方法](https://qiita.com/Kogia_sima/items/6899c5196813cf231054)





### 良い例
`&str`を使い、余計なアロケーションを避ける。
   ```rust
    fn greet(name: &str) {
        println!("Hello, {}!", name);
    }
    let name = "Alice";
    greet(name);
   ```





### 悪い例
不要に`String`を生成する。
   ```rust
    fn greet(name: String) {
        println!("Hello, {}!", name);
    }
    let name = String::from("Alice");
    greet(name);
   ```



<!---------------------------------------------------------------->



## 7. testアトリビュートの使用
`#[cfg(test)]`を使うことで、通常のビルドには含まれず、cargo testコマンドを実行したときにのみコンパイルされます。これにより、メインのコードベースをクリーンに保つことができます。<br>

### 参考
1. [Rustアトリビュート活用法！コンパイラへの指示からテストまで幅広く説明](https://ai-techblog.hatenablog.com/entry/2023/04/08/122017)





### 良い例
test アトリビュートを使ってtestコードを分ける。
   ```rust
    // メインのコード
    fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    // テストモジュール
    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn test_addition() {
            assert_eq!(add(2, 2), 4);
        }
    }
   ```





### 悪い例
内部でtestコードを実装する。
   ```rust
    // メインのコード
    fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    // テストコードがメインのコードと混在している

    mod tests {
        use super::*;

        #[test]
        fn test_addition() {
            assert_eq!(add(2, 2), 4);
        }
    }
   ```




<!---------------------------------------------------------------->



## 8. スレッドの適切な使用
スレッドを分ける際、`Arc`, `Mutex` を使うと安全にスレッド間でデータ共有ができます。<br>そうでない場合、データ競合のリスクがあります。
Rustのコンパイラはこの競合を検出できないため、ご注意ください。<br>

`Arc`:複数のスレッド間で所有権を共有するためのスマートポインタ ( C++ では std::shared_ptr )<br>
`Mutex`:データへの排他的アクセスを保証する仕組み




### 良い例
`Arc`, `Mutex` を使ってスレッド間で安全にデータを共有する。
   ```rust
    use std::sync::{Arc, Mutex};
    use std::thread;

    let data = Arc::new(Mutex::new(0));
    let handles: Vec<_> = (0..10).map(|_| {
        let data = Arc::clone(&data);
        thread::spawn(move || {
            let mut num = data.lock().unwrap();
            *num += 1;
        })
    }).collect();

    for handle in handles {
        handle.join().unwrap();
    }
   ```





### 悪い例
`Arc`, `Mutex` を使わずスレッド間データを操作する。
   ```rust
    let mut data = 0;
    let handles: Vec<_> = (0..10).map(|_| {
        thread::spawn(move || {
            data += 1; // スレッド間の競合が発生
        })
    }).collect();

    for handle in handles {
        handle.join().unwrap();
    }
   ```



<!---------------------------------------------------------------->



# 2. Want 要件

## 1. `Option<String>`と`String`の比較
文字列の変換は気を配っていないと地味にメモリを消費します。
これ以外の例は以下参考サイトにありますのでご確認ください。

### 参考
[Rust の型変換イディオム](https://qiita.com/legokichi/items/0f1c592d46a9aaf9a0ea)





### 良い例
clone()を使わず&strに変換し、比較する
   ```rust
    let option_string: Option<String> = Some("a");
    let string: String = String::from("b");

   if option_string.as_ref().unwrap_or(&String::new()) == &string{

   }
   ```





### 悪い例
clone()を使ってStringで比較する
   ```rust
    let option_string: Option<String> = Some("a");
    let string: String = String::from("b");

   if option_string.clone().unwrap_or_default() == string{
    
   }
   ```



<!---------------------------------------------------------------->


## 2. クロージャを使ったキャプチャ
Rustではクロージャを使うとスッキリ書けます。ご活用ください。





### 良い例
クロージャによりコードを簡潔にし、柔軟性を持たせることができる。
   ```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6];
    let even_numbers: Vec<i32> = numbers.into_iter().filter(|&x| x % 2 == 0).collect();
    println!("{:?}", even_numbers); // [2, 4, 6]
}
   ```





### 悪い例
同じ処理を行うために冗長なコードを書く。
   ```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6];
    let mut even_numbers = Vec::new();
    for &x in &numbers {
        if x % 2 == 0 {
            even_numbers.push(x);
        }
    }
    println!("{:?}", even_numbers); // [2, 4, 6]
}
   ```




<!---------------------------------------------------------------->



## 3. クロージャを使った一時的な参照
クロージャを使うことで、コードがシンプルで読みやすくなり、スコープが限定されるため、意図しない変更を防ぐことができます。




### 良い例
クロージャで一時的な参照を取得して操作する。
   ```rust
let mut num = 0;
let mut add = |x| num += x;
add(5);
println!("{}", num); // 5

   ```





### 悪い例
関数を使って直接操作し、可変参照を渡す。

   ```rust
fn add(num: &mut i32, x: i32) {
    *num += x;
}
let mut num = 0;
add(&mut num, 5);
println!("{}", num); // 5

   ```




<!---------------------------------------------------------------->



## 4. `iter().cloned()`を使い、必要な分だけクローンする。
以下理由が挙げられます。Vecサイズにもよりますが大きくメモリ使用量を削減できます。

### 理由
- メモリ効率:
    - clone()を使うと、ベクタ全体をクローンするため、余分なメモリを消費します。一方、iter()とcloned()を使うと、必要な要素だけをクローンするため、メモリ効率が良くなります。
- パフォーマンス:
    - clone()はベクタ全体をコピーするため、特に大きなベクタの場合、パフォーマンスに影響を与える可能性があります。iter()とcloned()を使うと、フィルタリングされた要素だけをクローンするため、パフォーマンスが向上することがあります。
- 柔軟性:
    - iter()とcloned()を使うことで、フィルタリングや他の操作を簡単に組み合わせることができます。これにより、コードがより柔軟で読みやすくなります。




### 良い例

   ```rust
fn main() {
    let vec = vec![1, 2, 3, 4, 5];


    let filtered_vec: Vec<i32> = vec
        .iter()
        .filter(|&&x| x % 2 == 0)
        .cloned()
        .collect();

    println!("{:?}", filtered_vec); // [2, 4]
}
   ```





### 悪い例

   ```rust
fn main() {
    let vec = vec![1, 2, 3, 4, 5];
    let cloned_vec = vec.clone(); // Vec全体をクローン

    let filtered_vec: Vec<i32> = cloned_vec
        .into_iter()
        .filter(|&x| x % 2 == 0)
        .collect();

    println!("{:?}", filtered_vec); // [2, 4]
}

   ```




<!---------------------------------------------------------------->



## 5. メモリ容量の事前予約 その2
ループなどで、追加のメモリ確保容量がわかり、<br>それが大きい場合はreserve_exactを使うとメモリ確保の回数を減らせ、パフォーマンスが向上します。
### 参考
1. [RustでVec, Stringのcapacityを取得・追加・縮小](https://rs.nkmk.me/rust-vec-string-capacity/#h2_4)




### 良い例
reserve_exactで追加のメモリ容量を確保する
   ```rust
struct Hoge {
    x: i32,
    data: Vec<i32>, // 任意のサイズ
}

fn main() {
    let outer_size = 10;

    let mut outer_vec: Vec<Hoge> = Vec::with_capacity(outer_size);
    let mut inner_vec: Vec<i32> = Vec::new();

    // [途中省略] outer_vecのdataに任意の値が入るとする（data.len()にばらつきがある）

    for outer in &outer_vec {
        inner_vec.reserve_exact(outer.data.len()); // 追加分の容量を予約
        inner_vec.extend(&outer.data);
    }
}

   ```





### 悪い例
容量を追加で確保せず、頻繁にメモリ再割り当てが発生する
   ```rust
struct Hoge {
    x: i32,
    data: Vec<i32>, // 任意のサイズ
}

fn main() {
    let outer_size = 10;

    let mut outer_vec: Vec<Hoge> = Vec::with_capacity(outer_size);
    let mut inner_vec: Vec<i32> = Vec::new();

    // [途中省略] outer_vecのdataに任意の値が入るとする（data.len()にばらつきがある）

    for outer in &outer_vec {
        // 追加分の容量を予約しない
        inner_vec.extend(&outer.data);
    }
}
   ```





<!---------------------------------------------------------------->



## 6. キャッシュの使用
重複計算を避けるためにキャッシュを利用する。特に統計処理など重い計算はHashmap等で保持しておくと取り出しも早いです。

### 参考
1. [Rustのコレクション型まとめ (VecやHashMapなど)](https://qiita.com/garkimasera/items/a6df4d1cd99bc5010a5e)
2. [Rustの高速化はHashmapから](https://zenn.dev/arome/articles/f9c52bf1c2a246)<br>
→Hashmapをより高速化したい場合はfxhashを使うと良いらしいです。（試した人教えて下さい）




### 良い例
キャッシュを利用して重複計算を避ける。
   ```rust
use std::collections::HashMap;

fn fib(n: u32, memo: &mut HashMap<u32, u32>) -> u32 {
    if let Some(&result) = memo.get(&n) {
        return result;
    }
    let result = if n <= 1 { n } else { fib(n - 1, memo) + fib(n - 2, memo) };
    memo.insert(n, result);
    result
}

   ```





### 悪い例
キャッシュを使用せず、計算を繰り返す。
   ```rust
fn fib(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    fib(n - 1) + fib(n - 2)
}

   ```




<!---------------------------------------------------------------->



## 7. エラー処理の最適化

### 補足
C++, C#に慣れた人ですとnullチェックとして`is_none()`を使いたくなりますが、<br>
Rustだとより簡潔に書けます！`Option`, `Result`型を使っていきましょう！





### 良い例
エラーを事前に確認して早期リターン。
   ```rust
fn process(data: Option<&str>) -> Result<(), &'static str> {
    let data = data.ok_or("No data provided")?;
    // データ処理
    Ok(())
}

   ```





### 悪い例
不要なエラーチェックを重複して行う。
   ```rust
fn process(data: Option<&str>) -> Result<(), &'static str> {
    if data.is_none() {
        return Err("No data provided");
    }
    let data = data.unwrap_or_default();
    // データ処理
    Ok(())
}

   ```




<!---------------------------------------------------------------->



## 8. エラーハンドリングではboolよりResultで返す
### 理由
1. エラーハンドリング:<br>
Result型を使うことで、エラーメッセージや詳細な情報を返すことができます。一方、boolは単純な真偽値しか返せません。
2. コードの可読性:<br>
Result型を使うことで、関数の意図が明確になり、エラーハンドリングが一貫して行われるため、コードの可読性が向上します。
3. 柔軟性:<br>
Result型を使うことで、エラーの種類や内容を柔軟に変更できます。これにより、関数がより汎用的になります。




### 良い例
Resultで返す。

   ```rust
    async fn load(&mut self) -> Result<(), Box<dyn Error>> {
        // ファイルパスを取得
        let filepath = match env::current_exe() {
            Ok(exe_path) => {
                let parent_dir = exe_path.parent().expect("Failed to get parent directry.");
                parent_dir.join("DatabaseSettings.csv")
            }
            Err(error) => {
                return Err(error.into());  // エラー時のみエラー内容を記載
            }
        };

        // ファイルをオープン
        let file = File::open(&filepath)?; // 共にResult型なら'?'でスッキリ

        // ファイル読出し
        let reader: BufReader<File> = BufReader::new(file);
        for line in reader.lines() {
            let line = match line {
                Ok(value) => value,
                Err(error) => {
                    return Err(error.into());  // エラー時のみエラー内容を記載
                }
            };

            self.log = SqlManager::from_str(line.as_str()).await?; // 共にResult型なら'?'でスッキリ
        }
    }
        
    fn main() {
        let _ = match load() {
            Ok(_) => {}
            Err(error) => {
                println!("{}", error.to_string()) // 1箇所でエラー内容表示
            }
        };
    }
   ```





### 悪い例
boolで返して都度エラーハンドリングを行う

   ```rust
    async fn load(&mut self) -> bool {
        // ファイルパスを取得
        let filepath = match env::current_exe() {
            Ok(exe_path) => {
                let parent_dir = exe_path.parent().expect("Failed to get parent directry.");
                parent_dir.join("DatabaseSettings.csv")
            }
            Err(error) => {
                println!("error:{}", error);
                return false;
            }
        };

        // ファイルをオープン
        let file = match File::open(&filepath_service) {
            Ok(file) => file,
            Err(error) => {
                println!("error:{}", error);
                return false;
            }
        };

        // ファイル読出し
        let reader: BufReader<File> = BufReader::new(file);
        for result in reader.lines() {
            let line = match result {
                Ok(value) => value,
                Err(error) => {
                    println!("error:{}", error);
                    return false;
                }
            };

            match SqlManager::from_str(line.as_str()).await {
                Ok(database) => self.log = database,
                _ => return false,
            }
        }
    }

    fn main() {
        let _ = load();
    }
   ```




<!---------------------------------------------------------------->



## 9. 複数のエラーパターンの処理
返り値がResult型の関数が入れ子になっている場合、`?`で省略できます。




### 良い例
`?` 演算子を使ってエラー処理を簡素化する。
   ```rust
fn read_file(path: &str) -> Result<String, std::io::Error> {
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}
   ```





### 悪い例
手動でエラーパターンを処理する。
   ```rust
fn read_file(path: &str) -> Result<String, std::io::Error> {
    let mut file = match File::open(path) {
        Ok(file) => file,
        Err(e) => return Err(e),
    };
    let mut contents = String::new();
    match file.read_to_string(&mut contents) {
        Ok(_) => Ok(contents),
        Err(e) => Err(e),
    }
}

   ```




<!---------------------------------------------------------------->



## 10. エラーチェーンの適切な構築

### 条件
場合によりますが、標準エラーメッセージが不十分だったり曖昧な場合に付け足したいとき

### さらに深めたい方へ
1. [Rust/AnyhowのTips](https://zenn.dev/yukinarit/articles/b39cd42820f29e)






### 良い例
anyhowクレートを使い、エラーチェーンを使って詳細なエラー情報を伝える。
   ```rust
use anyhow::{Context, Result};

fn read_config(path: &str) -> Result<String> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("Failed to read config file: {}", path))?;
    Ok(content)
}
   ```





### 悪い例
標準エラーメッセージをそのまま使う
   ```rust
use std::{fs, io};

fn read_config(path: &str) -> Result<String, io::Error> {
    let content = fs::read_to_string(path)?;
    Ok(content)
}
   ```





<!---------------------------------------------------------------->



## 11. 構造体初期化時にフィールド名と変数名が同名なら省略可
パフォーマンスには影響しませんが、コードが簡潔になります。





### 良い例

   ```rust
struct User {
    name: String,
    age: u32,
}

fn main() {
    let name = String::from("Alice");
    let age = 30;

    // フィールド名と変数名が同じ場合、省略
    let user = User { name, age };

    println!("User: {}, {}", user.name, user.age);
}

   ```





### 悪い例

   ```rust
struct User {
    name: String,
    age: u32,
}

fn main() {
    let name = String::from("Alice");
    let age = 30;

    // フィールド名と変数名が同じでも明示的に指定
    let user = User { name: name, age: age };

    println!("User: {}, {}", user.name, user.age);
}

   ```




<!---------------------------------------------------------------->



## 12. `ok_or` より `ok_or_else`
### 前提条件
- エラーハンドリングの為、Option型からResult型に変換したい。
- 型変換時にそこそこコストのある処理がある。

### 理由：
Option::ok_orはエラーではないときにもok_orの中が評価されます。<br>
そのため、ok_or_elseを使ってエラーのときだけ処理が実行されるようにするべきです。<br>
もしくは、ok_orの中で高コストな処理はしてはいけません。<br>

### 参考
1. [Rust のパフォーマンスに何が影響を与えているのか](https://qiita.com/benki/items/ee14ee6cb9f209a080e1)





### 良い例
`ok_or_else`を使う
   ```rust
fn generate_error_message() -> String {
    // 高コストな処理をシミュレート
    std::thread::sleep(std::time::Duration::from_secs(2));
    "Error occurred".to_string()
}

let some_option: Option<i32> = None;
let result: Result<i32, String> = some_option.ok_or_else(|| generate_error_message());
println!("{:?}", result); // Err("Error occurred")
   ```





### 悪い例
`ok_or`を使う
   ```rust
fn generate_error_message() -> String {
    // 高コストな処理をシミュレート
    std::thread::sleep(std::time::Duration::from_secs(2));
    "Error occurred".to_string()
}

let some_option: Option<i32> = None;
let result: Result<i32, String> = some_option.ok_or(generate_error_message());
println!("{:?}", result); // Err("Error occurred")
   ```




<!---------------------------------------------------------------->



## 13. `Vec`を参照で渡すなら`&Vec<T>`よりもスライス`&[T]`が良い
以下理由が挙げられます。

### 理由
1. メモリ効率:<br>
スライスは元のデータの一部を参照するだけなので、追加のメモリを消費しません。<br>
一方、&Vec<T>はベクタ全体を参照するため、少し余分なメモリを使用します。
2. 柔軟性:<br>
スライスは配列や他のスライス、ベクタなど、さまざまなコレクション型と互換性があります。<br>
これにより、関数がより汎用的になり、異なるデータ型を扱いやすくなります。
3. パフォーマンス:<br>
スライスを使うことで、関数呼び出しのオーバーヘッドが減少する場合があります。<br>
特に、関数が頻繁に呼び出される場合や大きなデータセットを扱う場合に効果的です。
4. APIの一貫性:<br>
Rustの標準ライブラリや多くのクレートはスライスを受け取る関数を提供しています。<br>
これにより、コードの一貫性が保たれ、他のRustコードとの互換性が向上します。





### 良い例

   ```rust
fn print_elements(slice: &[i32]) {
    for &item in slice {
        println!("{}", item);
    }
}

fn main() {
    let vec = vec![1, 2, 3, 4, 5];
    print_elements(&vec); // Vecをスライスとして渡す

    let array = [6, 7, 8, 9, 10];
    print_elements(&array); // 配列をスライスとして渡す
}

   ```





### 悪い例

   ```rust
fn print_elements(vec: &Vec<i32>) {
    for &item in vec {
        println!("{}", item);
    }
}

fn main() {
    let vec = vec![1, 2, 3, 4, 5];
    print_elements(&vec); // Vecをそのまま渡す

    // 配列を渡すことはできない
    // let array = [6, 7, 8, 9, 10];
    // print_elements(&array); // コンパイルエラー
}

   ```



<!---------------------------------------------------------------->



## 14. パス操作の最適化
パスの操作にはPath, PathBufを使用すると型安全性を確保でき、<br>
他にもファイルパス操作に便利なメソッドが多数用意されているため、使用すると便利です。




### 良い例
Path を使ってファイルパスを扱う。
   ```rust
fn open_file(path: &str) {
    println!("Opening file: {}", path);
}
   ```





### 悪い例
文字列リテラルや String を直接渡す。
   ```rust
use std::path::Path;

fn open_file<P: AsRef<Path>>(path: P) {
    let path = path.as_ref();
    println!("Opening file: {}", path.display());
}
   ```



<!---------------------------------------------------------------->



## 15. ファイルIOのバッファリング





### 良い例
`BufReader` や `BufWriter` を使ってファイルI/Oを効率化する。<br><br><br>
   ```rust
use std::fs::File;
use std::io::{self, BufReader, BufWriter, Write, Read};

fn main() -> io::Result<()> {
    let input_file = File::open("input.txt")?;
    let output_file = File::create("output.txt")?;

    let mut reader = BufReader::new(input_file);
    let mut writer = BufWriter::new(output_file);

    let mut buffer = String::new();
    reader.read_to_string(&mut buffer)?;
    writer.write_all(buffer.as_bytes())?;

    Ok(())
}

   ```





### 悪い例
直接ファイル操作を行い、パフォーマンスが低下する。<br>
※例のコードでは、直接ファイル操作を行っています。<br>
バッファリングを行わないため、I/O操作の回数が増え、パフォーマンスが低下します。
   ```rust
use std::fs::File;
use std::io::{self, Write, Read};

fn main() -> io::Result<()> {
    let mut input_file = File::open("input.txt")?;
    let mut output_file = File::create("output.txt")?;

    let mut buffer = [0; 1024];
    loop {
        let bytes_read = input_file.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        output_file.write_all(&buffer[..bytes_read])?;
    }

    Ok(())
}

   ```





<!---------------------------------------------------------------->



## 16. `Option::map_or`の利用
`None`の場合デフォルト値を設定するという意図がある場合、`match`より`map_or`を使う方が意図が伝わります。<br>これは`map_or`のシグネチャが`map_or(default, |x| ...)`に対し、<br>
`match`は一般的に複数のケースを処理するために使われる為です。




### 良い例
`map_or` を使ってデフォルト値を設定する。

   ```rust
let maybe_num = Some(2);
let result = maybe_num.map_or(10, |x| x * 2);
println!("{}", result); // 4
   ```





### 悪い例
`match` でデフォルト値を設定する。
   ```rust
let maybe_num = Some(2);
let result = match maybe_num {
    Some(x) => x * 2,
    None => 10,
};
println!("{}", result); // 4

   ```




<!---------------------------------------------------------------->



## 17. スマートポインタの活用

### 前提条件
- 複数のコンポーネントで同じデータを共有したい。

### 理由
`Rc`（Reference Counted）や `Arc`（Atomic Reference Counted）は、<br>
複数の所有者が同じデータを共有するために使われます。<br>
`Rc` はシングルスレッド環境で、`Arc` はマルチスレッド環境で使用されます。<br>
一方、Box は単一所有権を持つため、共有所有権を持たせる場合には不適切です。





### 良い例
`Rc` や `Arc` を使って共有所有権を持つ。
   ```rust
use std::rc::Rc;
use std::sync::Arc;
use std::thread;

fn main() {
    // Rcを使った例
    let rc_example = Rc::new(String::from("Hello, Rc!"));
    let rc_clone = Rc::clone(&rc_example);
    println!("{}", rc_clone);

    // Arcを使った例
    let arc_example = Arc::new(String::from("Hello, Arc!"));
    let arc_clone = Arc::clone(&arc_example);

    let handle = thread::spawn(move || {
        println!("{}", arc_clone);
    });

    handle.join().unwrap();
}

   ```





### 悪い例
直接 `Box` を使い、不必要なコピーを作る。
   ```rust
fn main() {
    // Boxを使った例
    let box_example = Box::new(String::from("Hello, Box!"));
    let box_clone = box_example.clone(); // 不必要なコピー
    println!("{}", box_clone);
}

   ```




<!---------------------------------------------------------------->



## 18. `Mutex` と `Condvar` の連携
Condvar（条件変数）を使って、スレッドが特定の条件が満たされるまで待機し、<br>条件が満たされたときに通知を受け取ることができます。これにより、スレッドが無駄にCPUリソースを消費することなく待機できます。




### 良い例
`Mutex` と `Condvar` を使ってスレッドの待機と通知を効率的に行う。
   ```rust
use std::sync::{Arc, Mutex, Condvar};
use std::thread;

let pair = Arc::new((Mutex::new(false), Condvar::new()));
let pair_clone = Arc::clone(&pair);

thread::spawn(move || {
    let (lock, cvar) = &*pair_clone;
    let mut started = lock.lock().unwrap();
    *started = true;
    cvar.notify_one();
});

let (lock, cvar) = &*pair;
let mut started = lock.lock().unwrap();
while !*started {
    started = cvar.wait(started).unwrap();
}
   ```





### 悪い例
スリープを使った不確実な待機をし、同期も不確実
   ```rust
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

let started = Arc::new(Mutex::new(false));
let started_clone = Arc::clone(&started);

thread::spawn(move || {
    let mut started = started_clone.lock().unwrap();
    *started = true;
});

thread::sleep(Duration::from_secs(1)); // 確実ではない
let started = started.lock().unwrap();
assert!(*started);
   ```



<!---------------------------------------------------------------->



## 19. 明示的なメモリ開放
rustではスコープを抜ければ自動でメモリ開放しますが、<br>
ファイルハンドルやネットワーク接続などのリソースを早期に解放する必要がある場合、<br>
明示的に開放することで他のプロセスやスレッドがリソースを利用できるようになります。




### 良い例
明示的に開放する。
   ```rust
    {
        let file = std::fs::File::open("example.txt").unwrap();
        // ファイルを使用する処理
        std::mem::drop(file); // 明示的にファイルを閉じる
        // ここでファイルは閉じられている
    }
   ```





### 悪い例
(スコープを抜けて自動的に開放されるまで、) 開放しない。

   ```rust
    {
        let file = std::fs::File::open("example.txt").unwrap();
        // ファイルを使用する処理

        // ここでファイルは閉じずオープンなまま
    }
   ```




<!---------------------------------------------------------------->



## 20. タイムアウト付きの操作
他言語同様、DBアクセスや同期操作、排他制御など、タイムアウトを設定しないと待ち続けてしまいます。適切に設定ください。




### 良い例
タイムアウト付きで同期操作を行う。
   ```rust
use std::sync::{Arc, Mutex, Condvar};
use std::time::Duration;

let pair = Arc::new((Mutex::new(false), Condvar::new()));
let pair_clone = Arc::clone(&pair);

let _ = std::thread::spawn(move || {
    let (lock, cvar) = &*pair_clone;
    let mut started = lock.lock().unwrap();
    *started = true;
    cvar.notify_one();
});

let (lock, cvar) = &*pair;
let mut started = lock.lock().unwrap();
let result = cvar.wait_timeout(started, Duration::from_secs(2)).unwrap();
if !*result.0 {
    println!("Timeout occurred");
}

   ```





### 悪い例
タイムアウトなしで待ち続けてしまう。
   ```rust
use std::sync::{Arc, Mutex, Condvar};

let pair = Arc::new((Mutex::new(false), Condvar::new()));
let pair_clone = Arc::clone(&pair);

let _ = std::thread::spawn(move || {
    let (lock, cvar) = &*pair_clone;
    let mut started = lock.lock().unwrap();
    *started = true;
    cvar.notify_one();
});

let (lock, cvar) = &*pair;
let mut started = lock.lock().unwrap();
while !*started {
    started = cvar.wait(started).unwrap();
} // タイムアウトがないため、永久に待つ可能性

   ```



<!---------------------------------------------------------------->



## 21. ループ内で不必要に複数回実行される処理
Rustに限らず基本的なことですが、意外と見落としがちで地味にパフォーマンスに影響します。<br>
今一度同様の部分がないか確認しましょう。




### 良い例
ループ外で変換処理を行う
   ```rust
    // ループ外で変換処理
    let fixed_name = PartType::to_part_name(r#type);

    for x in &name_list {
        if x.name == fixed_name
        {
            list.push(x.name);
        }
    }
   ```





### 悪い例
ループ内で変換処理を行う（無駄に複数回実行される）
   ```rust
    for x in &name_list {
        // ループ内で変換処理
        if x.name == PartType::to_part_name(r#name) 
        {
            list.push(x.name);
        }
    }
   ```



<!---------------------------------------------------------------->



# 3. Conditional 要件
メリット，デメリットを考慮し、適切な方を選ぶ要件です。

## 1. `Default`トレイト実装

### 例1. `#[derive(Default)]` で `default` 値の実装を行う
- 全てのフィールドでその方の `default` 値を持つことが条件だが、シンプルで手間いらず
- 将来的にデフォルト値が変わった時にコードを変更しなくても良い。

### 例2. 構造体に対して自分で `default` 値の実装を行う
- デフォルト値をカスタマイズできる
- 複雑な初期化が可能<br>
外部リソース（例えば、ファイルやデータベース）を利用する場合や他要素の計算結果を初期値とする場合など

### 補足
- 双方メリットありますが、例2.を使わざるを得ない状況（Default値を任意に設定したい）<br>は必ず出てくると思うので、例2.で統一するのが良いと個人的には思います。

### 参考
1. [Rust Defaultについて調べてみた](https://zenn.dev/yuki_ishii/articles/702d0c32a1f6ab)





## 例1. `#[derive(Default)]`で実装

   ```rust
#[derive(Default)]
struct Config {
    name: String,
    price: f64,
    api_key: String,
}
   ```





## 例2. カスタマイズ`Default`実装

   ```rust
// #[derive(Default)]は外す
struct Config {
    name: String,
    price: f64,
    api_key: String,
}

// Defaultの実装
impl Default for Config {
    fn default() -> Self {
        Self {
            name: "Default name".to_string(),
            price: 999.0,
            api_key: std::env::var("API_KEY").unwrap_or_else(|_| "default_key".to_string());
        }
    }
}
   ```



<!---------------------------------------------------------------->



## 2. `Copy`, `Clone`トレイト実装

### 例1. `Copy`トレイトを使った方が良い場合
1. 小さくてシンプルなデータ型:
    - `Copy`トレイトは、メモリ上で小さくてシンプルなデータ型に適しています。<br>例えば、整数型（`i32`、`u32`など）や浮動小数点型（`f32`、`f64`）などです。<br>
    - 例: `let x = 5; let y = x;` ここで、`x` は `Copy` トレイトを持つため、`y` にコピーされても `x` は有効なままです。
2. パフォーマンスが重要な場合:
    - `Copy` トレイトを使うと、値の複製が非常に高速になります。<br>
    これは、`Copy`トレイトがメモリのビット単位のコピーを行うためです。
    - 例: 数値計算やパフォーマンスが重要なループ内での値の複製。
3. 所有権の移動を避けたい場合:(コード例)
    - `Copy` トレイトを持つ型は、所有権の移動を伴わずに値を複製できます。<br>
    これにより、所有権の管理が簡単になります。
    - 例: 関数に引数として渡す際に、所有権を移動させずに値を渡したい場合。

### 例2. `Clone` トレイトを使った方が良い場合
1. 複雑なデータ型:
    - 大きなデータ構造やヒープにデータを持つ型（例えば、VecやString）はCloneトレイトを使う方が適しています。
    - 例: `let s1 = String::from("hello"); let s2 = s1.clone();`
2. カスタム複製ロジックが必要な場合:(コード例)
    - `Clone` トレイトを使うと、カスタムの複製ロジックを実装できます。
    - 例: 特定のフィールドだけを複製したい場合。

### 参考
1. [Rust Defaultについて調べてみた](https://zenn.dev/yuki_ishii/articles/702d0c32a1f6ab)





## 例1. Copyトレイトの利用

   ```rust
#[derive(Copy, Clone)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 10, y: 20 };
    let p2 = p1; // p1は依然として有効
    println!("p1: ({}, {}), p2: ({}, {})", p1.x, p1.y, p2.x, p2.y);
}

   ```





## 例2. Cloneトレイトの利用

   ```rust
#[derive(Clone)]
struct Person {
    name: String,
    age: u32,
}

impl Clone for Person {
    fn clone(&self) -> Self {
        println!("Cloning Person: {}", self.name);
        Person {
            name: self.name.clone(),
            age: self.age,
        }
    }
}

fn main() {
    let person1 = Person {
        name: String::from("Alice"),
        age: 30,
    };
    let person2 = person1.clone(); // カスタム複製ロジックを使用

    println!("person1: {} ({})", person1.name, person1.age);
    println!("person2: {} ({})", person2.name, person2.age);
}

   ```






# 4. リンク集
### まずはここから!!
|  Link  |  Contents  |
| ---- | ---- |
|  [Rust-Coding-Rule](https://github.com/Yamaha-Motor-Robotics-SMT-Software/Rust-Coding-Rule) | 社内で統一しているコーディングルールです。<br>プロジェクトを作成する場合は必ず則ってください。 |

### まとめサイト
|  Link  |  Contents  |
| ---- | ---- |
|  [Rustのリンク集](https://qiita.com/mosh/items/7e327dafbe53b72ad99d) |  学習向けや、実装時に参照するサイト、書き方、新機能の情報などのページがまとめられています  |
|  [Rust の学習に役立つサイト](https://qiita.com/shikuno_dev/items/d8b832294b152877b80d) |  学習～実践向けのサイトが載っています  |
|  [Rustを始める時に役立つ資料](https://qiita.com/kxkx5150/items/ff70c564c5c136ba3d25) |  メモリ管理、所有権、文字列操作、イテレータ、非同期など一通りの学習項目に役立つ資料がまとまっています  |
|  [Linux系OSとRustで参考になる記事一覧](https://zenn.dev/ennui_lw/scraps/ee26125bb72563) |  数は少ないですが良い記事が多いです!  |

### 学習
|  Link  |  Contents  |
| ---- | ---- |
|  [Rust ツアー - Let's go on an adventure!](https://tourofrust.com/00_ja.html)  |  入門サイト。Rustの基本的な文法を実際にサイト内でコードを実行しながら学ぶことができます。 |
|  [Rustの日本語ドキュメント/Japanese Docs for Rust](https://doc.rust-jp.rs/)  |  Rustの公式ドキュメントです。網羅的ですが冗長で少々わかりにくいので、次のRust入門がおすすめです。  |
|  [Rust入門](https://zenn.dev/mebiusbox/books/22d4c1ed9b0003)  |  日本語で分かりやすく解説されたドキュメントです。  |
|  [100 Exercises To Learn Rust に挑戦 ](https://qiita.com/namn1125/items/bd1b4cd028874189a3c1) | Rustの100本ノックに挑戦した技術ブログです。 |

### 他言語で慣れている方向け
|  Link  |  Contents  |
| ---- | ---- |
|  [C++erのためのRust入門(未完)](https://qiita.com/EqualL2/items/a232ab0855f145bd5997) | C++ ⇒ Rust入門 |
|  [Rust for C#/.NET Developers](https://microsoft.github.io/rust-for-dotnet-devs/latest/) | C# ⇒ Rust入門<br>C# からの置き換えで役に立ちました。<br>特に11.1にある LinQ の対応表は助かりました。 |
|  [[翻訳] Python プログラマーのための Rust 入門](https://qiita.com/t2y/items/434854fab16159a7c0f7) | Python ⇒ Rust入門 |

### チートシート
|  Link  |  Contents  |
| ---- | ---- |
|  [Rust Language Cheat Sheet](https://cheats.rs/) | Rustに慣れてからも役に立つチートシートです |
|  [Rust の型変換イディオム](https://qiita.com/legokichi/items/0f1c592d46a9aaf9a0ea) | String, Vec, Option, Result等の型変換からC++文字列との型変換まで載っています |

### パフォーマンス
|  Link  |  Contents  |
| ---- | ---- |
|  [The Rust Performance Book](https://nnethercote.github.io/perf-book/introduction.html) | パフォーマンスを上げるための方法、代替案などが記載されています。 |
|  [Rust のパフォーマンスに何が影響を与えているのか](https://qiita.com/benki/items/ee14ee6cb9f209a080e1) | 4つのテーマについて実際にパフォーマンスを計測し比較した記事です |

### 環境
|  Link  |  Contents  |
| ---- | ---- |
|  [crates.io](https://crates.io/) | Rustのクレートのデフォルトリポジトリです。<br>ここからクレートを検索します|
|  [docs.rs](https://docs.rs/) | Rustのクレートのドキュメント集です |
|  [Rustの便利クレート](https://qiita.com/qryxip/items/7c16ab9ef3072c1d7199) | 便利になるクレートだけでなく、技術的課題を解決するためのクレートにも触れています |
|  [Rust開発時の便利ツールたち](https://zenn.dev/toru3/articles/14312f4dbf18b6) | 名前の通りです。<br>フォーマッタについては上記コーディングルールの方を優先してください。 |