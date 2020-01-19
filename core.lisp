(def! sum-to (fn* (n)
    (let* (rec (fn* (a b)
            (if (= a 0)
                b
                (rec (- a 1) (+ b a)))))
        (rec n 0))))

(def! fact (fn* (n)
    (let* (rec (fn* (a b)
            (if (= a 0)
                b
                (rec (- a 1) (* b a)))))
        (rec n 1))))

(def! pow (fn* (x n)
    (let* (rec (fn* (a b)
            (if (= a 0)
                b
                (rec (- a 1) (* b x)))))
        (rec n 1))))
