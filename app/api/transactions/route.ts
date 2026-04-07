import { NextResponse } from "next/server";

// TODO: Import your actual database client here (e.g., Prisma, pg, typeorm)
// import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch") || "All Branches";

    // ==========================================
    // BACKEND LOGIC (To be replaced with DB call)
    // ==========================================
    /*
      Example Postgres Query for Start/End Balance carry over:
      SELECT * FROM daily_balances WHERE branch_id = $1 AND record_date = CURRENT_DATE;
      
      Example Postgres Query for filtering transactions:
      SELECT * FROM transactions WHERE branch_id = $1 AND transaction_date = CURRENT_DATE;
    */

    // Simulate backend response payload based on the requested branch
    const mockData = {
      stats: {
        pawnedToday: branch === "All Branches" ? 83 : 28,
        buyBack: branch === "All Branches" ? 37 : 12,
        renewed: branch === "All Branches" ? 25 : 8,
        soldItem: branch === "All Branches" ? 41 : 28,
        startingBalance: branch === "All Branches" ? 73400 : 15400,
        endingBalance: branch === "All Branches" ? 105500 : 28500,
      },
      transactions: branch === "All Branches" ? [
        { transactionNo: "SJS007610", branch: "Taguig Branch", purpose: "Start", date: "4/1/2026", time: "8:21 AM", cashIn: "28", cashInDetails: "from vault", cashOut: "0", returnVal: "0", unit: "----", unitCode: "---", pawn: "0", storage: "0" },
        { transactionNo: "MKT001001", branch: "Makati Main Branch", purpose: "Buy Back", date: "4/1/2026", time: "9:00 AM", cashIn: "0", cashInDetails: "", cashOut: "1000", returnVal: "0", unit: "Laptop", unitCode: "MKT-102", pawn: "0", storage: "0" }
      ] : [
         // Specific branch mock
        { transactionNo: "SJS007610", branch, purpose: "Start", date: "4/1/2026", time: "8:21 AM", cashIn: "28", cashInDetails: "Opening cash", cashOut: "0", returnVal: "0", unit: "----", unitCode: "---", pawn: "0", storage: "0" }
      ]
    };

    return NextResponse.json(mockData);

  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ==========================================
    // BACKEND LOGIC (Cash In adds, Cash Out subtracts)
    // ==========================================
    /*
      Example Postgres Transaction Insertion:
      INSERT INTO transactions (transaction_no, branch_id, purpose, cash_in, cash_in_details, cash_out, unit)
      VALUES ($1, $2, $3, $4, $5, $6, $7);

      UPDATE daily_balances 
      SET ending_balance = ending_balance + $4 - $6 
      WHERE branch_id = $2 AND record_date = CURRENT_DATE;
    */

    return NextResponse.json({ message: "Transaction saved successfully", status: "success", data: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
  }
}
